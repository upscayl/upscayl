import sharp from "sharp";
import mainWindow from "../main-window";
import { getQuality } from "./config-variables";
import logit from "./logit";

const convertAndScale = async (
  originalImagePath: string,
  upscaledImagePath: string,
  processedImagePath: string,
  scale: string,
  saveImageAs: string,
  onError: (error: any) => void
) => {
  const originalImage = await sharp(originalImagePath).metadata();
  if (!mainWindow || !originalImage) {
    throw new Error("Could not grab the original image!");
  }
  // Resize the image to the scale
  const newImage = sharp(upscaledImagePath)
    .resize(
      originalImage.width && originalImage.width * parseInt(scale),
      originalImage.height && originalImage.height * parseInt(scale)
    )
    .withMetadata(); // Keep metadata
  // Change the output according to the saveImageAs
  if (saveImageAs === "png") {
    newImage.png({ quality: 100 - getQuality() });
  } else if (saveImageAs === "jpg") {
    console.log("Quality: ", getQuality());
    newImage.jpeg({ quality: 100 - getQuality() });
  }
  // Save the image
  const buffer = await newImage.toBuffer();
  sharp(buffer)
    .toFile(processedImagePath)
    .then(() => {
      logit("✅ Done converting to: ", upscaledImagePath);
    })
    .catch((error) => {
      logit("❌ Error converting to: ", saveImageAs, error);
      onError(error);
    });
};

export default convertAndScale;
