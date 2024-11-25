export const MODELS = {
  "upscayl-standard-4x": {
    id: "upscayl-standard-4x",
    name: "Upscayl Standard",
  },
  "upscayl-lite-4x": {
    id: "upscayl-lite-4x",
    name: "Upscayl Lite",
  },
  "remacri-4x": {
    id: "remacri-4x",
    name: "Remacri (Non-Commercial)",
  },
  "ultramix-balanced-4x": {
    id: "ultramix-balanced-4x",
    name: "Ultramix (Non-Commercial)",
  },
  "ultrasharp-4x": {
    id: "ultrasharp-4x",
    name: "Ultrasharp (Non-Commercial)",
  },
  "digital-art-4x": {
    id: "digital-art-4x",
    name: "Digital Art",
  },
};

export type ModelId = keyof typeof MODELS;
