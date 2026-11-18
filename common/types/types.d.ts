import { ImageFormat } from "@electron/types/types";

/** "auto" tries Core ML first (Apple Silicon only) and falls back to ncnn, "ncnn" always uses ncnn. */
export type UpscaleEngine = "auto" | "ncnn";

export type EngineInfo = {
  coreml: boolean;
};

export type ImageUpscaylPayload = {
  imagePath: string;
  outputPath: string;
  scale: string;
  model: string;
  gpuId: string;
  saveImageAs: ImageFormat;
  overwrite: boolean;
  compression: string;
  noImageProcessing: boolean;
  customWidth: string;
  useCustomWidth: boolean;
  tileSize: number;
  ttaMode: boolean;
  copyMetadata: boolean;
  engine?: UpscaleEngine;
};

export type DoubleUpscaylPayload = {
  model: string;
  /**
   * The path to the image to upscale.
   */
  imagePath: string;
  outputPath: string;
  scale: string;
  gpuId: string;
  saveImageAs: ImageFormat;
  compression: string;
  noImageProcessing: boolean;
  customWidth: string;
  useCustomWidth: boolean;
  tileSize: number;
  ttaMode: boolean;
  copyMetadata: boolean;
  engine?: UpscaleEngine;
};

export type BatchUpscaylPayload = {
  batchFolderPath: string;
  outputPath: string;
  model: string;
  gpuId: string;
  saveImageAs: ImageFormat;
  scale: string;
  compression: string;
  noImageProcessing: boolean;
  customWidth: string;
  useCustomWidth: boolean;
  tileSize: number;
  ttaMode: boolean;
  copyMetadata: boolean;
  engine?: UpscaleEngine;
};

export type RemoveBackgroundPayload = {
  inputPath: string;
};

export type RemoveBackgroundProgress = {
  stage: "decode" | "inference" | "encode";
};

export type RemoveBackgroundDone = {
  outputPath: string;
  width: number;
  height: number;
};

export type RemoveBackgroundError = {
  message: string;
};

export type ExportRemoveBackgroundPayload = {
  sourcePath: string;
  defaultName: string;
};
