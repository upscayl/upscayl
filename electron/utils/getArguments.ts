export const getCommandArguments = (
  type:
    | "singleImage"
    | "singleImageSharpen"
    | "doubleUpscayl"
    | "doubleUpscaylSecondPass"
    | "batch",
  inputDir?: any,
  fullfileName?: any,
  outFile?: any,
  modelsPath?: any,
  model?: any,
  scale?: any,
  gpuId?: any,
  saveImageAs?: any,
  isAlpha?: any
) => {
  switch (type) {
    case "singleImage":
      return [
        "-i",
        inputDir + "/" + fullfileName,
        "-o",
        outFile,
        "-s",
        scale === 2 ? 4 : scale,
        "-m",
        modelsPath,
        "-n",
        model,
        gpuId ? `-g ${gpuId}` : "",
        "-f",
        saveImageAs,
      ];
    case "singleImageSharpen":
      return [
        "-i",
        inputDir + "/" + fullfileName,
        "-o",
        outFile,
        "-s",
        scale,
        "-x",
        "-m",
        modelsPath + "/" + model,
        gpuId ? `-g ${gpuId}` : "",
        "-f",
        saveImageAs,
      ];
    case "doubleUpscayl":
      return [
        "-i",
        inputDir + "/" + fullfileName,
        "-o",
        outFile,
        "-s",
        4,
        "-m",
        modelsPath,
        "-n",
        model,
        gpuId ? `-g ${gpuId}` : "",
        "-f",
        saveImageAs,
      ];
    case "doubleUpscaylSecondPass":
      return [
        "-i",
        isAlpha ? outFile + ".png" : outFile,
        "-o",
        isAlpha ? outFile + ".png" : outFile,
        "-s",
        4,
        "-m",
        modelsPath,
        "-n",
        model,
        gpuId ? `-g ${gpuId}` : "",
        "-f",
        isAlpha ? "" : saveImageAs,
      ];
    case "batch":
      return [
        "-i",
        inputDir,
        "-o",
        outFile,
        "-s",
        4,
        "-m",
        modelsPath,
        "-n",
        model,
        gpuId ? `-g ${gpuId}` : "",
        "-f",
        saveImageAs,
      ];
  }
};
