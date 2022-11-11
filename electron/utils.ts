import { spawn } from "child_process";
import { execPath } from "./binaries";

function upscaylImage(
  inputFile: string,
  outFile: string,
  modelsPath: string,
  model: string
) {
  // UPSCALE
  let upscayl = spawn(
    execPath("realesrgan"),
    ["-i", inputFile, "-o", outFile, "-s", "4", "-m", modelsPath, "-n", model],
    {
      cwd: undefined,
      detached: false,
    }
  );

  return upscayl;
}

module.exports = { upscaylImage };
