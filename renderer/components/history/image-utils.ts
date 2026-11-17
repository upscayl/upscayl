import { sanitizePath } from "@common/sanitize-path";

export const imageUrl = (path: string) => `file:///${sanitizePath(path)}`;

export type ImageSize = { width: number; height: number };

export const loadImageSize = (path: string) =>
  new Promise<ImageSize>((resolve, reject) => {
    const image = new Image();
    image.onload = () =>
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = reject;
    image.src = imageUrl(path);
  });
