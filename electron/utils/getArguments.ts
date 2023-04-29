import getPlatform from "../getPlatform";
const slash: string = getPlatform() === "win" ? "\\" : "/";

export const getSingleImageArguments = (
  inputDir: string,
  fullfileName: string,
  outFile: string,
  modelsPath: string,
  model: string,
  scale: any,
  gpuId: string,
  saveImageAs: string
) => {
  return [
    "-i",
    inputDir + slash + fullfileName,
    "-o",
    outFile,
    "-s",
    scale,
    "-m",
    modelsPath,
    "-n",
    model,
    gpuId ? `-g ${gpuId}` : "",
    "-f",
    saveImageAs,
  ];
};

export const getSingleImageSharpenArguments = (
  inputDir: string,
  fullfileName: string,
  outFile: string,
  modelsPath: string,
  model: string,
  scale: any,
  gpuId: string,
  saveImageAs: string
) => {
  return [
    "-i",
    inputDir + slash + fullfileName,
    "-o",
    outFile,
    "-s",
    scale,
    "-x",
    "-m",
    modelsPath + slash + model,
    gpuId ? `-g ${gpuId}` : "",
    "-f",
    saveImageAs,
  ];
};

export const getDoubleUpscaleArguments = (
  inputDir: string,
  fullfileName: string,
  outFile: string,
  modelsPath: string,
  model: string,
  gpuId: string,
  saveImageAs: string,
  scale: string
) => {
  return [
    "-i",
    inputDir + slash + fullfileName,
    "-o",
    outFile,
    "-s",
    scale,
    "-m",
    modelsPath,
    "-n",
    model,
    gpuId ? `-g ${gpuId}` : "",
    "-f",
    saveImageAs,
  ];
};

export const getDoubleUpscaleSecondPassArguments = (
  isAlpha: boolean,
  outFile: string,
  modelsPath: string,
  model: string,
  gpuId: string,
  saveImageAs: string,
  scale: string
) => {
  return [
    "-i",
    isAlpha ? outFile + ".png" : outFile,
    "-o",
    isAlpha ? outFile + ".png" : outFile,
    "-s",
    scale,
    "-m",
    modelsPath,
    "-n",
    model,
    gpuId ? `-g ${gpuId}` : "",
    "-f",
    isAlpha ? "" : saveImageAs,
  ];
};

export const getBatchArguments = (
  inputDir: string,
  outputDir: string,
  modelsPath: string,
  model: string,
  gpuId: string,
  saveImageAs: string,
  scale: string
) => {
  return [
    "-i",
    inputDir,
    "-o",
    outputDir,
    "-s",
    scale,
    "-m",
    modelsPath,
    "-n",
    model,
    gpuId ? `-g ${gpuId}` : "",
    "-f",
    saveImageAs,
  ];
};

// ! REDUNDANT
export const getBatchSharpenArguments = (
  inputDir: string,
  outputDir: string,
  modelsPath: string,
  model: string,
  gpuId: string,
  saveImageAs: string,
  scale: string
) => {
  return [
    "-i",
    inputDir,
    "-o",
    outputDir,
    "-s",
    scale,
    "-x",
    "-m",
    modelsPath + slash + model,
    gpuId ? `-g ${gpuId}` : "",
    "-f",
    saveImageAs,
  ];
};
