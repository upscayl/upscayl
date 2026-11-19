import { clipboard, nativeImage } from "electron";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ELECTRON_COMMANDS } from "../../common/electron-commands";
import logit from "../utils/logit";

const loadImage = (filePath: string) => {
  if (/\.webp$/i.test(filePath)) {
    try {
      const buffer = fs.readFileSync(filePath);
      const img = nativeImage.createFromBuffer(buffer);
      if (!img.isEmpty()) return img;
      return nativeImage.createFromDataURL(
        `data:image/webp;base64,${buffer.toString("base64")}`,
      );
    } catch {
      return nativeImage.createFromPath(filePath);
    }
  }
  return nativeImage.createFromPath(filePath);
};

const copyImage = (event: any, imagePath: string) => {
  try {
    if (!imagePath) {
      event.sender.send(
        ELECTRON_COMMANDS.COPY_IMAGE_ERROR,
        "No image path provided",
      );
      return;
    }

    let clean = String(imagePath).trim();
    if (clean.startsWith("file://")) {
      try {
        clean = fileURLToPath(clean);
      } catch {
        clean = clean.replace(/^file:\/\/\/?/, "");
      }
    }
    clean = path.normalize(clean);

    if (fs.existsSync(clean)) {
      const img = loadImage(clean);
      if (img.isEmpty()) {
        logit("❌ Failed to create image from path: ", clean);
        event.sender.send(
          ELECTRON_COMMANDS.COPY_IMAGE_ERROR,
          "Invalid image format",
        );
        return;
      }
      clipboard.writeImage(img);
      logit("📋 Image copied to clipboard: ", clean);
      event.sender.send(ELECTRON_COMMANDS.COPY_IMAGE_SUCCESS, clean);
    } else {
      logit("❌ File not found for copying: ", clean);
      event.sender.send(
        ELECTRON_COMMANDS.COPY_IMAGE_ERROR,
        "Image file not found on disk",
      );
    }
  } catch (error: any) {
    const msg = error?.message || String(error);
    logit("Error copying image: ", msg);
    event.sender.send(ELECTRON_COMMANDS.COPY_IMAGE_ERROR, msg);
  }
};

export default copyImage;
