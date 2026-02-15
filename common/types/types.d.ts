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
  /** One or more folder paths to process in queue order. */
  batchFolderPaths: string[];
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
  /** If true, overwrite existing output files; otherwise skip them. */
  overwrite: boolean;
};

/** Statistics sent when a batch upscale run completes successfully. */
export type BatchStats = {
  /** Batch start time in milliseconds since epoch (suitable for `new Date(ms)`). */
  startTime: number;
  /** Batch end time (ms). */
  endTime: number;
  /** Total processing time in ms. */
  totalTimeMs: number;
  /** Total number of images created. */
  totalImages: number;
  /** Average time per image in ms. */
  avgTimePerImageMs: number;
  /** Average size per output image in bytes. */
  avgSizeBytes: number;
  /** Total size of all output images in bytes. */
  totalSizeBytes: number;
};
