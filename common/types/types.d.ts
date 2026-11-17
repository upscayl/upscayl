import { ImageFormat } from "@electron/types/types";

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
};

export type RemoveBackgroundPayload = {
  inputPath: string;
};

export type RemoveBackgroundProgress = {
  stage: "decode" | "inference" | "encode";
};

export type HistoryEntryKind =
  | "upscayl"
  | "double-upscayl"
  | "batch-upscayl"
  | "remove-background";

export type HistoryEntry = {
  id: string;
  kind: HistoryEntryKind;
  name: string;
  originalPath: string;
  outputPath: string;
  folderPath?: string;
  createdAt: number;
  model?: string;
  scale?: string;
  saveImageAs?: ImageFormat;
  width?: number;
  height?: number;
};

export type RemoveBackgroundDone = {
  outputPath: string;
  inputPath: string;
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
