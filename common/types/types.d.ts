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

export type DeleteHistoryTarget =
  | { mode: "single"; id: number }
  | { mode: "batch"; batch_id: string }
  | { mode: "all" };

export type HistoryEntryKind =
  | "upscayl"
  | "double-upscayl"
  | "batch-upscayl"
  | "remove-background";

export type HistoryEntrySettings = {
  entryKind?: HistoryEntryKind;
  model?: string;
  scale?: string;
  saveImageAs?: ImageFormat;
  width?: number;
  height?: number;
};

export type HistoryEntry = {
  id: number;
  batchId: string | null;
  inputPath: string;
  inputSha256: string | null;
  kind: HistoryEntryKind;
  outputPath: string;
  parentRunId: number | null;
  settings: HistoryEntrySettings;
  thumbPath: string | null;
  createdAt: number;
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
