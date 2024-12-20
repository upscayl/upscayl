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
  ttaMode,
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
  ttaMode: boolean;
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
    // TTA MODE
    ttaMode ? "-x" : "",
  ];
};

export const getDoubleUpscaleArguments = ({
  inputDir,
  fullfileName,
  outFile,
  modelsPath,
  scale,
  model,
  gpuId,
  saveImageAs,
  customWidth,
  tileSize,
}: {
  inputDir: string;
  fullfileName: string;
  outFile: string;
  modelsPath: string;
  scale: string;
  model: string;
  gpuId: string;
  saveImageAs: ImageFormat;
  customWidth: string;
  tileSize: number;
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
  ttaMode,
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
  ttaMode: boolean;
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
    // COMPRESSION
    "-c",
    compression,
    // TILE SIZE
    tileSize ? `-t` : "",
    tileSize ? tileSize.toString() : "",
    // TTA MODE
    ttaMode ? "-x" : "",
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
  ttaMode,
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
  ttaMode: boolean;
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
    // TTA MODE
    ttaMode ? "-x" : "",
  ];
};
