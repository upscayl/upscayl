const { spawn } = require("child_process");
const { execPath } = require("./binaries");
/**
 *
 * @param {*} inputFile
 * @param {*} outFile
 * @param {*} modelsPath
 * @param {*} model
 * @returns
 */
function upscaylImage(inputFile, outFile, modelsPath, model) {
  // UPSCALE
  let upscayl = spawn(
    execPath("realesrgan"),
    ["-i", inputFile, "-o", outFile, "-s", 4, "-m", modelsPath, "-n", model],
    {
      cwd: null,
      detached: false,
    }
  );

  return upscayl;
}

module.exports = { upscaylImage };
