export const MODELS = {
  "realesrgan-x4plus": {
    id: "realesrgan-x4plus",
    name: "Upscayl Standard",
  },
  "realesrgan-x4fast": {
    id: "realesrgan-x4fast",
    name: "Upscayl Lite",
  },
  remacri: {
    id: "remacri",
    name: "Remacri (Non-Commercial)",
  },
  ultramix_balanced: {
    id: "ultramix_balanced",
    name: "Ultramix (Non-Commercial)",
  },
  ultrasharp: {
    id: "ultrasharp",
    name: "Ultrasharp (Non-Commercial)",
  },
  "realesrgan-x4plus-anime": {
    id: "realesrgan-x4plus-anime",
    name: "Digital Art",
  },
};

export type ModelId = keyof typeof MODELS;

export const DEFAULT_MODELS_ID_LIST = Object.keys(MODELS).map(
  (modelId) => modelId,
);
