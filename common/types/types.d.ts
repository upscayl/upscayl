export type ImageUpscaylPayload = {
  imagePath: string;
  outputPath?: string;
  scale: string;
  model: string;
  gpuId: string;
  saveImageAs: string;
  overwrite: boolean;
  compression: number;
  noImageProcessing: boolean;
};

export type DoubleUpscaylPayload = {
  model: string;
  imagePath: string;
  outputPath: string;
  scale: string;
  gpuId: string;
  saveImageAs: string;
  compression: number;
  noImageProcessing: boolean;
};

export type BatchUpscaylPayload = {
  batchFolderPath: string;
  outputPath: string;
  model: string;
  gpuId: string;
  saveImageAs: string;
  scale: string;
  compression: number;
  noImageProcessing: boolean;
};
