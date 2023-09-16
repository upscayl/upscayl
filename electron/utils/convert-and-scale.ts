import sharp from "sharp";
import logit from "./logit";
import { getMainWindow } from "../main-window";
import { compression } from "./config-variables";

const convertAndScale = async (
  originalImagePath: string,
  upscaledImagePath: string,
  processedImagePath: string,
  scale: string,
  saveImageAs: string,
  onError: (error: any) => void
) => {
  const mainWindow = getMainWindow();

  const originalImage = await sharp(originalImagePath).metadata();

  if (!mainWindow || !originalImage) {
    throw new Error("Could not grab the original image!");
  }
  // Resize the image to the scale
  const newImage = sharp(upscaledImagePath, {
    limitInputPixels: false,
  }).resize(
    originalImage.width && originalImage.width * parseInt(scale),
    originalImage.height && originalImage.height * parseInt(scale)
  );

  // Convert compression percentage (0-100) to compressionLevel (0-9)
  const compressionLevel = Math.round((compression / 100) * 9);
  if (saveImageAs === "png") {
    // Change the output according to the saveImageAs
    newImage.png({ compressionLevel });
  } else if (saveImageAs === "jpg") {
    console.log("compression: ", compression);
    newImage.jpeg({
      quality: 100 - (compression === 100 ? 99 : compression),
      chromaSubsampling: "4:4:4",
    });
  }

  const buffer = await newImage.toBuffer();
  try {
    await sharp(buffer, {
      limitInputPixels: false,
    })
      .withMetadata({
        orientation: originalImage.orientation,
        density: originalImage.density,
      })
      .toFile(processedImagePath);
  } catch (error) {
    logit("❌ Error converting to: ", saveImageAs, error);
    onError(error);
  }

  logit("✅ Done converting to: ", upscaledImagePath);
};

export default convertAndScale;
