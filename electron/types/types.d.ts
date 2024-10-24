export const imageFormats = ["png", "jpg", "jpeg", "webp"] as const;

export type ImageFormat = (typeof imageFormats)[number];
