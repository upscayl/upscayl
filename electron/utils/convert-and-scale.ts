import fs from "fs";
import sharp, { FormatEnum } from "sharp";
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
  if (saveImageAs === "png" && scale === "4" && compression === 0) {
    logit("Skipping png compression for 4x scale");
    return;
  }
  const mainWindow = getMainWindow();

  const originalImage = await sharp(originalImagePath).metadata();

  fs.access(originalImagePath, fs.constants.F_OK, (err) => {
    if (err) {
      throw new Error("Could not grab the original image!");
    }
  });

  if (!mainWindow || !originalImage) {
    throw new Error("Could not grab the original image!");
  }

  // Resize the image to the scale
  const newImage = sharp(upscaledImagePath, {
    limitInputPixels: false,
  }).resize(
    originalImage.width && originalImage.width * parseInt(scale),
    originalImage.height && originalImage.height * parseInt(scale),
    {
      fit: "outside",
    }
  );

  // Convert compression percentage (0-100) to compressionLevel (0-9)
  const compressionLevel = Math.round((compression / 100) * 9);

  logit(
    "📐 Processing Image: ",
    JSON.stringify({
      originalWidth: originalImage.width,
      originalHeight: originalImage.height,
      scale,
      saveImageAs,
      compressionPercentage: compression,
      compressionLevel,
    })
  );

  const buffer = await newImage.toBuffer();
  try {
    await sharp(buffer, {
      limitInputPixels: false,
    })
      .toFormat(saveImageAs as keyof FormatEnum, {
        ...(saveImageAs === "jpg" && {
          quality: 100 - (compression === 100 ? 99 : compression),
          chromaSubsampling: "4:4:4",
        }),
        // For PNGs, compression enables indexed colors automatically,
        // so we need to warn the user that this will happen
        // https://sharp.pixelplumbing.com/api-output#png
        ...(saveImageAs === "png" &&
          compression > 0 && {
            ...(compression > 0 && {
              quality: 100 - (compression === 100 ? 99 : compression),
            }),
            compressionLevel: 9,
          }),
        force: true,
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
