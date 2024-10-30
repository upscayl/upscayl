export const MODELS = {
  "upscayl-standard-4x": {
    id: "upscayl-standard-4x",
    name: "Upscayl Standard",
  },
  "upscayl-lite-4x": {
    id: "upscayl-lite-4x",
    name: "Upscayl Lite",
  },
  remacri: {
    id: "remacri-4x",
    name: "Remacri (Non-Commercial)",
  },
  ultramix_balanced: {
    id: "ultramix-balanced-4x",
    name: "Ultramix (Non-Commercial)",
  },
  ultrasharp: {
    id: "ultrasharp-4x",
    name: "Ultrasharp (Non-Commercial)",
  },
  "digital-art-4x": {
    id: "digital-art-4x",
    name: "Digital Art",
  },
};

export type ModelId = keyof typeof MODELS;

export const DEFAULT_MODELS_ID_LIST = Object.keys(MODELS).map(
  (modelId) => modelId,
);
