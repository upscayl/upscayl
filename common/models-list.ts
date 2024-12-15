export const MODELS = {
  "upscayl-standard-4x": {
    id: "upscayl-standard-4x",
    name: "Upscayl Standard",
    description: "Suitable for most images.",
  },
  "upscayl-lite-4x": {
    id: "upscayl-lite-4x",
    name: "Upscayl Lite",
    description:
      "Suitable for most images. High-speed upscaling with minimal quality loss.",
  },
  "remacri-4x": {
    id: "remacri-4x",
    name: "Remacri (Non-Commercial)",
    description:
      "For natural images. Added sharpness and detail. No commercial use.",
  },
  "ultramix-balanced-4x": {
    id: "ultramix-balanced-4x",
    name: "Ultramix (Non-Commercial)",
    description: "For natural images with a balance of sharpness and detail.",
  },
  "ultrasharp-4x": {
    id: "ultrasharp-4x",
    name: "Ultrasharp (Non-Commercial)",
    description: "For natural images with a focus on sharpness.",
  },
  "digital-art-4x": {
    id: "digital-art-4x",
    name: "Digital Art",
    description: "For digital art and illustrations.",
  },
};

export type ModelId = keyof typeof MODELS;
