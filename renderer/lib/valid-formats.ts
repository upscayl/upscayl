export const VALID_IMAGE_FORMATS = [
  "png",
  "jpg",
  "jpeg",
  "jfif",
  "webp",
] as const;

export type ImageFormat = (typeof VALID_IMAGE_FORMATS)[number];
