import { spawn } from "child_process";
import { execPath } from "./get-resource-paths";

export const spawnUpscayl = (
  command: string[],
  logit: (...args: any) => void
) => {
  logit("📢 Upscayl Command: ", command);

  const spawnedProcess = spawn(execPath, command, {
    cwd: undefined,
    detached: false,
  });

  return {
    process: spawnedProcess,
    kill: () => spawnedProcess.kill(),
  };
};
