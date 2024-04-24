import getModelScale from "../../common/check-model-scale";
import { getPlatform } from "./get-device-specs";
import { ImageFormat } from "../types/types";
const slash: string = getPlatform() === "win" ? "\\" : "/";

export const getSingleImageArguments = ({
  inputDir,
  fileNameWithExt,
  outFile,
  modelsPath,
  model,
  scale,
  gpuId,
  saveImageAs,
  customWidth,
  tileSize,
  compression,
}: {
  inputDir: string;
  fileNameWithExt: string;
  outFile: string;
  modelsPath: string;
  model: string;
  scale: string;
  gpuId: string;
  saveImageAs: ImageFormat;
  customWidth: string;
  tileSize: number;
  compression: string;
}) => {
  const modelScale = getModelScale(model);
  let includeScale = modelScale !== scale && !customWidth;
  return [
    // INPUT IMAGE
    "-i",
    inputDir + slash + fileNameWithExt,
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
    // COMPRESSION
    "-c",
    compression,
    // TILE SIZE
    tileSize ? `-t` : "",
    tileSize ? tileSize.toString() : "",
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
  tileSize,
}: {
  inputDir: string;
  fullfileName: string;
  outFile: string;
  modelsPath: string;
  model: string;
  gpuId: string;
  saveImageAs: ImageFormat;
  tileSize: number;
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
    // TILE SIZE
    tileSize ? `-t` : "",
    tileSize ? tileSize.toString() : "",
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
  compression,
  tileSize,
}: {
  outFile: string;
  modelsPath: string;
  model: string;
  gpuId: string;
  saveImageAs: ImageFormat;
  scale: string;
  customWidth: string;
  compression: string;
  tileSize: number;
}) => {
  const modelScale = (parseInt(getModelScale(model)) ** 2).toString();
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
    // COMPRESSION
    "-c",
    compression,
    // TILE SIZE
    tileSize ? `-t` : "",
    tileSize ? tileSize.toString() : "",
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
  compression,
  tileSize,
}: {
  inputDir: string;
  outputDir: string;
  modelsPath: string;
  model: string;
  gpuId: string;
  saveImageAs: ImageFormat;
  scale: string;
  customWidth: string;
  compression: string;
  tileSize: number;
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
    // COMPRESSION
    "-c",
    compression,
    // TILE SIZE
    tileSize ? `-t` : "",
    tileSize ? tileSize.toString() : "",
  ];
};
