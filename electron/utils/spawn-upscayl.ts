import { ChildProcess, spawn } from "child_process";
import { EventEmitter } from "events";
import { existsSync } from "fs";
import { join } from "path";
import { StringDecoder } from "string_decoder";
import { app } from "electron";
import { coremlExecPath, execPath } from "./get-resource-paths";
import { FEATURE_FLAGS } from "../../common/feature-flags";
import { UpscaleEngine } from "../../common/types/types";

/**
 * The part of a ChildProcess the upscale commands use. It is not always a single process: when the Core ML
 * engine turns a request down, the same command is started again with ncnn and the caller never notices.
 */
export interface UpscaylProcess extends EventEmitter {
  readonly stderr: EventEmitter;
  readonly pid: number | undefined;
  readonly spawnfile: string;
  readonly spawnargs: string[];
  kill: () => boolean;
}

// upscayl-coreml exits with 3 (before it has written anything) when the request is not for it
const NOT_FOR_COREML = 3;
const FALLBACK_PREFIX = "coreml-fallback:";

const getFlagValue = (args: string[], flag: string) => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
};

/**
 * Can the Core ML engine be tried for this command? Only Apple Silicon Macs have it, and it can't write WebP.
 * Whether it handles the model is up to the engine itself.
 */
export const canTryCoreml = (args: string[], engine: UpscaleEngine = "auto") =>
  engine !== "ncnn" &&
  !FEATURE_FLAGS.APP_STORE_BUILD &&
  process.platform === "darwin" &&
  process.arch === "arm64" &&
  existsSync(coremlExecPath) &&
  getFlagValue(args, "-f") !== "webp";

class UpscaylRun extends EventEmitter implements UpscaylProcess {
  readonly stderr = new EventEmitter();
  spawnfile = "";
  spawnargs: string[] = [];
  private child: ChildProcess | null = null;
  private killed = false;

  constructor(
    private readonly args: string[],
    tryCoreml: boolean,
    private readonly logit: (...args: any) => void,
  ) {
    super();
    if (tryCoreml) {
      this.startCoreml();
    } else {
      this.startNcnn();
    }
  }

  get pid() {
    return this.child?.pid;
  }

  kill = () => {
    this.killed = true;
    return this.child ? this.child.kill() : false;
  };

  private startCoreml() {
    const args = [
      ...this.args,
      "--cache",
      join(app.getPath("userData"), "coreml"),
    ];
    let reason = "";
    let switchedToNcnn = false;

    const useNcnnInstead = (why: string) => {
      if (switchedToNcnn) return;
      switchedToNcnn = true;
      this.logit("Engine: Core ML was not used, running ncnn instead: ", why);
      this.startNcnn();
    };

    this.logit("Engine: Core ML");
    const child = this.launch(coremlExecPath, args);

    // The commands look at the start of every piece for a percentage, so pass one line at a time. A chunk can
    // end in the middle of a line, that part waits for the next chunk.
    const decoder = new StringDecoder("utf8");
    let unfinished = "";
    const handleLine = (line: string) => {
      if (line.trim() === "") return;
      if (line.startsWith(FALLBACK_PREFIX)) {
        reason = line.slice(FALLBACK_PREFIX.length).trim();
      } else {
        this.stderr.emit("data", line + "\n");
      }
    };

    child.stderr!.on("data", (chunk: Buffer) => {
      const lines = (unfinished + decoder.write(chunk)).split("\n");
      unfinished = lines.pop() ?? "";
      lines.forEach(handleLine);
    });
    child.on("error", (error) => {
      if (this.killed) return;
      useNcnnInstead(String(error));
    });
    child.on("close", (code, signal) => {
      if (switchedToNcnn) return;
      handleLine(unfinished + decoder.end());
      unfinished = "";
      if (code === NOT_FOR_COREML && !this.killed) {
        useNcnnInstead(reason || "not supported");
        return;
      }
      switchedToNcnn = true;
      this.emit("close", code, signal);
    });
  }

  private startNcnn() {
    this.logit("Engine: ncnn (Vulkan)");
    const child = this.launch(execPath, this.args);
    child.stderr!.on("data", (chunk: Buffer) =>
      this.stderr.emit("data", chunk),
    );
    child.on("error", (error) => this.emit("error", error));
    child.on("close", (code, signal) => this.emit("close", code, signal));
  }

  private launch(binary: string, args: string[]) {
    this.logit("Upscayl Command: ", binary, args);
    const child = spawn(binary, args, { cwd: undefined, detached: false });
    this.child = child;
    this.spawnfile = binary;
    this.spawnargs = child.spawnargs;
    return child;
  }
}

export const spawnUpscayl = (
  command: string[],
  logit: (...args: any) => void,
  engine: UpscaleEngine = "auto",
) => {
  const args = command.filter((arg) => arg !== "");
  const run = new UpscaylRun(args, canTryCoreml(args, engine), logit);

  return {
    process: run as UpscaylProcess,
    kill: () => run.kill(),
  };
};
