import { app } from "electron";
import settings from "electron-settings";
import { readdir } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path, { extname, join } from "node:path";
import { ELECTRON_COMMANDS } from "../../common/electron-commands";
import { HistoryEntry } from "../../common/types/types";
import { getMainWindow } from "../main-window";
import {
  createHistoryEntries,
  createHistoryEntry,
  NewHistoryEntry,
} from "../../database/history";
import logit from "./logit";
import { homedir } from "node:os";
import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import { IMAGE_EXTENSIONS } from "@common/constants";

const sha256File = async (path: string) => {
  const hash = createHash("sha256");
  await pipeline(createReadStream(path), hash);
  return hash.digest("hex");
};

export const getDefaultHistoryDir = () => {
  if (process.platform === "linux") {
    return join(
      process.env.XDG_DATA_HOME || join(homedir(), ".local", "share"),
      "upscayl",
    );
  }

  return app.getPath("appData");
};

export const getHistoryDir = () =>
  (settings.getSync("history-folder") as string | undefined) ||
  getDefaultHistoryDir();

const getImagesInFolder = async (folder: string): Promise<string[]> => {
  const entries = await readdir(folder, { withFileTypes: true });

  return entries
    .filter(
      (e) => e.isFile() && IMAGE_EXTENSIONS.has(extname(e.name).toLowerCase()),
    )
    .map((e) => join(folder, e.name))
    .sort();
};

export const saveHistoryEntry = async (input: NewHistoryEntry) => {
  let entries: HistoryEntry[] = [];

  try {
    if (input.kind === "batch-upscayl") {
      const inputImages = await getImagesInFolder(input.inputPath);
      const outputImages = await getImagesInFolder(input.outputPath);

      const outputByStem = new Map(
        outputImages.map((p) => [path.parse(p).name, p]),
      );

      const pairs = inputImages.flatMap((inputPath) => {
        const outputPath = outputByStem.get(path.parse(inputPath).name);
        return outputPath ? [{ inputPath, outputPath }] : [];
      });

      const batchId = randomUUID();

      const addedEntries = await Promise.all(
        pairs.map(
          async ({ inputPath, outputPath }) =>
            ({
              model: input.model,
              inputPath: inputPath,
              outputPath: outputPath,
              kind: input.kind,
              scale: input.scale,
              inputSha256: await sha256File(inputPath),
              batchId,
            }) satisfies NewHistoryEntry,
        ),
      );

      if (addedEntries.length > 0) {
        const newEntries = createHistoryEntries(addedEntries);
        entries = [...newEntries];
      }
    } else {
      const fileHash = await sha256File(input.inputPath);

      const historyEntry = createHistoryEntry({
        model: input.model,
        inputSha256: fileHash,
        inputPath: input.inputPath,
        outputPath: input.outputPath,
        kind: input.kind,
        scale: input.scale,
      });

      entries = [{ ...historyEntry }];
    }
  } catch (error) {
    logit("❌ History Copy Error: ", error);
  }

  getMainWindow()?.webContents.send(
    ELECTRON_COMMANDS.HISTORY_ENTRIES_ADDED,
    entries,
  );
};
