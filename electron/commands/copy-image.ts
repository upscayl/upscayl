import { clipboard, nativeImage } from "electron";
import fs from "fs";
import path from "path";
import logit from "../utils/logit";

const copyImage = (event: any, imagePath: string) => {
  try {
    if (!imagePath) return;
    let clean = decodeURIComponent(
      String(imagePath).replace(/^file:\/\/\/?/, ""),
    );
    clean = path.win32 ? path.win32.normalize(clean) : path.normalize(clean);

    if (fs.existsSync(clean)) {
      const img = nativeImage.createFromPath(clean);
      clipboard.writeImage(img);
      logit("📋 Image copied to clipboard: ", clean);
      event.sender.send("COPY_IMAGE_SUCCESS", clean);
    } else {
      logit("❌ File not found for copying: ", clean);
    }
  } catch (error: any) {
    logit("Error copying image: ", error?.message || error);
  }
};

export default copyImage;
