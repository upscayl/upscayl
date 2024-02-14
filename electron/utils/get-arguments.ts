import { getPlatform } from "./get-device-specs";
import { ImageFormat } from "./types";
const slash: string = getPlatform() === "win" ? "\\" : "/";

export const getSingleImageArguments = (
  inputDir: string,
  fullfileName: string,
  outFile: string,
  modelsPath: string,
  model: string,
  scale: any,
  gpuId: string,
  saveImageAs: ImageFormat,
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
    gpuId ? "-g" : "",
    gpuId ? gpuId : "",
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
  saveImageAs: ImageFormat,
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
    gpuId ? "-g" : "",
    gpuId ? gpuId : "",
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
  saveImageAs: ImageFormat,
  scale: string,
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
    gpuId ? "-g" : "",
    gpuId ? gpuId : "",
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
  saveImageAs: ImageFormat,
  scale: string,
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
    gpuId ? "-g" : "",
    gpuId ? gpuId : "",
    isAlpha ? "" : "-f",
    isAlpha ? "" : saveImageAs,
  ];
};

export const getBatchArguments = (
  inputDir: string,
  outputDir: string,
  modelsPath: string,
  model: string,
  gpuId: string,
  saveImageAs: ImageFormat,
  scale: string,
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
    gpuId ? "-g" : "",
    gpuId ? gpuId : "",
    "-f",
    saveImageAs,
  ];
};
