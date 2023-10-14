import { spawn } from "child_process";
import { execPath } from "./get-resource-paths";

export const spawnUpscayl = (
  binaryName: string,
  command: string[],
  logit: (...args: any) => void
) => {
  logit("📢 Upscayl Command: ", command);

  const spawnedProcess = spawn(execPath("bin"), command, {
    cwd: undefined,
    detached: false,
  });

  return {
    process: spawnedProcess,
    kill: () => spawnedProcess.kill(),
  };
};
