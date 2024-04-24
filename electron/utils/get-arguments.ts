import getModelScale from "../../common/check-model-scale";
import { getPlatform } from "./get-device-specs";
import { ImageFormat } from "../types/types";
const slash: string = getPlatform() === "win" ? "\\" : "/";

export const getSingleImageArguments = ({
  inputDir,
  fullfileName,
  outFile,
  modelsPath,
  model,
  scale,
  gpuId,
  saveImageAs,
  customWidth,
}: {
  inputDir: string;
  fullfileName: string;
  outFile: string;
  modelsPath: string;
  model: string;
  scale: string;
  gpuId: string;
  saveImageAs: ImageFormat;
  customWidth: string;
}) => {
  const modelScale = getModelScale(model);
  let includeScale = modelScale !== scale && !customWidth;
  return [
    // INPUT IMAGE
    "-i",
    inputDir + slash + fullfileName,
    // OUTPUT IMAGE
    "-o",
    outFile,
    // OUTPUT SCALE
    includeScale ? "-s" : "",
    includeScale ? scale : "",
    // MODELS PATH
    "-m",
    modelsPath,
    // MODEL NAME
    "-n",
    model,
    // GPU ID
    gpuId ? "-g" : "",
    gpuId ? gpuId : "",
    // FORMAT
    "-f",
    saveImageAs,
    // CUSTOM WIDTH
    customWidth ? `-w` : "",
    customWidth ? customWidth : "",
  ];
};

export const getDoubleUpscaleArguments = ({
  inputDir,
  fullfileName,
  outFile,
  modelsPath,
  model,
  gpuId,
  saveImageAs,
}: {
  inputDir: string;
  fullfileName: string;
  outFile: string;
  modelsPath: string;
  model: string;
  gpuId: string;
  saveImageAs: ImageFormat;
}) => {
  return [
    // INPUT IMAGE
    "-i",
    inputDir + slash + fullfileName,
    // OUTPUT IMAGE
    "-o",
    outFile,
    // MODELS PATH
    "-m",
    modelsPath,
    // MODEL NAME
    "-n",
    model,
    // GPU ID
    gpuId ? `-g` : "",
    gpuId ? gpuId : "",
    // FORMAT
    "-f",
    saveImageAs,
  ];
};

export const getDoubleUpscaleSecondPassArguments = ({
  outFile,
  modelsPath,
  model,
  gpuId,
  saveImageAs,
  scale,
  customWidth,
}: {
  outFile: string;
  modelsPath: string;
  model: string;
  gpuId: string;
  saveImageAs: ImageFormat;
  scale: string;
  customWidth: string;
}) => {
  const modelScale = getModelScale(model);
  let includeScale = modelScale !== scale && !customWidth;
  return [
    // INPUT IMAGE
    "-i",
    outFile,
    // OUTPUT IMAGE
    "-o",
    outFile,
    // OUTPUT SCALE
    includeScale ? "-s" : "",
    includeScale ? scale : "",
    // MODELS PATH
    "-m",
    modelsPath,
    // MODEL NAME
    "-n",
    model,
    // GPU ID
    gpuId ? `-g` : "",
    gpuId ? gpuId : "",
    // FORMAT
    "-f",
    saveImageAs,
    // CUSTOM WIDTH
    customWidth ? `-w` : "",
    customWidth ? customWidth : "",
  ];
};

export const getBatchArguments = ({
  inputDir,
  outputDir,
  modelsPath,
  model,
  gpuId,
  saveImageAs,
  scale,
  customWidth,
}: {
  inputDir: string;
  outputDir: string;
  modelsPath: string;
  model: string;
  gpuId: string;
  saveImageAs: ImageFormat;
  scale: string;
  customWidth: string;
}) => {
  const modelScale = getModelScale(model);
  let includeScale = modelScale !== scale && !customWidth;

  return [
    // INPUT IMAGE
    "-i",
    inputDir,
    // OUTPUT IMAGE
    "-o",
    outputDir,
    // OUTPUT SCALE
    includeScale ? "-s" : "",
    includeScale ? scale : "",
    // MODELS PATH
    "-m",
    modelsPath,
    // MODEL NAME
    "-n",
    model,
    // GPU ID
    gpuId ? `-g` : "",
    gpuId ? gpuId : "",
    // FORMAT
    "-f",
    saveImageAs,
    // CUSTOM WIDTH
    customWidth ? `-w` : "",
    customWidth ? customWidth : "",
  ];
};
