import { spawn } from "child_process";
import { execPath } from "./binaries";

export const spawnUpscayl = (
  binaryName: string,
  command: string[],
  logit: (...args: any) => void
) => {
  logit("ℹ Upscayl Command: ", command);

  const spawnedProcess = spawn(execPath(binaryName), command, {
    cwd: undefined,
    detached: false,
  });

  return {
    process: spawnedProcess,
    kill: () => spawnedProcess.kill(),
  };
};
