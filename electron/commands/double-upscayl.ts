import path, { parse } from "path";
import { getMainWindow } from "../main-window";
import {
  childProcesses,
  customModelsFolderPath,
  outputFolderPath,
  quality,
  saveOutputFolder,
  setStopped,
  stopped,
} from "../utils/config-variables";
import DEFAULT_MODELS from "../constants/models";
import slash from "../utils/slash";
import { spawnUpscayl } from "../utils/spawn-upscayl";
import {
  getDoubleUpscaleArguments,
  getDoubleUpscaleSecondPassArguments,
} from "../utils/get-arguments";
import { modelsPath } from "../utils/get-resource-paths";
import logit from "../utils/logit";
import COMMAND from "../constants/commands";
import sharp from "sharp";

const doubleUpscayl = async (event, payload) => {
  const mainWindow = getMainWindow();
  if (!mainWindow) return;

  const model = payload.model as string;
  const imagePath = payload.imagePath;
  let inputDir = (imagePath.match(/(.*)[\/\\]/) || [""])[1];
  let outputDir = path.normalize(payload.outputPath);

  if (saveOutputFolder === true && outputFolderPath) {
    outputDir = outputFolderPath;
  }
  const gpuId = payload.gpuId as string;
  const saveImageAs = payload.saveImageAs as string;

  const isDefaultModel = DEFAULT_MODELS.includes(model);

  // COPY IMAGE TO TMP FOLDER

  const fullfileName = imagePath.split(slash).slice(-1)[0] as string;
  const fileName = parse(fullfileName).name;
  const outFile =
    outputDir + slash + fileName + "_upscayl_16x_" + model + "." + saveImageAs;

  let scale = "4";
  if (model.includes("x2")) {
    scale = "2";
  } else if (model.includes("x3")) {
    scale = "3";
  } else {
    scale = "4";
  }

  // UPSCALE
  let upscayl = spawnUpscayl(
    "realesrgan",
    getDoubleUpscaleArguments(
      inputDir,
      fullfileName,
      outFile,
      isDefaultModel ? modelsPath : customModelsFolderPath ?? modelsPath,
      model,
      gpuId,
      saveImageAs,
      scale
    ),
    logit
  );

  childProcesses.push(upscayl);

  setStopped(false);
  let failed = false;
  let isAlpha = false;
  let failed2 = false;

  const onData = (data) => {
    if (!mainWindow) return;
    // CONVERT DATA TO STRING
    data = data.toString();
    // SEND UPSCAYL PROGRESS TO RENDERER
    mainWindow.webContents.send(COMMAND.DOUBLE_UPSCAYL_PROGRESS, data);
    // IF PROGRESS HAS ERROR, UPSCAYL FAILED
    if (data.includes("invalid gpu") || data.includes("failed")) {
      upscayl.kill();
      failed = true;
    }
    if (data.includes("has alpha channel")) {
      isAlpha = true;
    }
  };

  const onError = (data) => {
    if (!mainWindow) return;
    mainWindow.setProgressBar(-1);
    data.toString();
    // SEND UPSCAYL PROGRESS TO RENDERER
    mainWindow.webContents.send(COMMAND.DOUBLE_UPSCAYL_PROGRESS, data);
    // SET FAILED TO TRUE
    failed = true;
    mainWindow &&
      mainWindow.webContents.send(
        COMMAND.UPSCAYL_ERROR,
        "Error upscaling image. Error: " + data
      );
    upscayl.kill();
    return;
  };

  const onClose2 = async (code) => {
    if (!mainWindow) return;
    if (!failed2 && !stopped) {
      logit("💯 Done upscaling");
      logit("♻ Scaling and converting now...");
      mainWindow.webContents.send(COMMAND.SCALING_AND_CONVERTING);
      try {
        const originalImage = await sharp(
          inputDir + slash + fullfileName
        ).metadata();
        if (!mainWindow || !originalImage) {
          throw new Error("Could not grab the original image!");
        }
        // Resize the image to the scale
        const newImage = sharp(isAlpha ? outFile + ".png" : outFile)
          .resize(
            originalImage.width &&
              originalImage.width * parseInt(payload.scale),
            originalImage.height &&
              originalImage.height * parseInt(payload.scale)
          )
          .withMetadata(); // Keep metadata
        // Change the output according to the saveImageAs
        if (saveImageAs === "png") {
          newImage.png({ quality: 100 - quality });
        } else if (saveImageAs === "jpg") {
          newImage.jpeg({ quality: 100 - quality });
        }
        // Save the image
        await newImage
          .toFile(isAlpha ? outFile + ".png" : outFile)
          .then(() => {
            logit(
              "✅ Done converting to: ",
              isAlpha ? outFile + ".png" : outFile
            );
          })
          .catch((error) => {
            logit("❌ Error converting to: ", saveImageAs, error);
            upscayl.kill();
            onError(error);
          });
        mainWindow.setProgressBar(-1);
        mainWindow.webContents.send(
          COMMAND.DOUBLE_UPSCAYL_DONE,
          isAlpha
            ? (outFile + ".png").replace(
                /([^/\\]+)$/i,
                encodeURIComponent((outFile + ".png").match(/[^/\\]+$/i)![0])
              )
            : outFile.replace(
                /([^/\\]+)$/i,
                encodeURIComponent(outFile.match(/[^/\\]+$/i)![0])
              )
        );
      } catch (error) {
        logit("❌ Error reading original image metadata", error);
        mainWindow &&
          mainWindow.webContents.send(
            COMMAND.UPSCAYL_ERROR,
            "Error processing (scaling and converting) the image. Please report this error on Upscayl GitHub Issues page."
          );
        upscayl.kill();
      }
    }
  };

  upscayl.process.stderr.on("data", onData);
  upscayl.process.on("error", onError);
  upscayl.process.on("close", (code) => {
    // IF NOT FAILED
    if (!failed && !stopped) {
      // UPSCALE
      let upscayl2 = spawnUpscayl(
        "realesrgan",
        getDoubleUpscaleSecondPassArguments(
          isAlpha,
          outFile,
          isDefaultModel ? modelsPath : customModelsFolderPath ?? modelsPath,
          model,
          gpuId,
          saveImageAs,
          scale
        ),
        logit
      );

      childProcesses.push(upscayl2);

      upscayl2.process.stderr.on("data", (data) => {
        if (!mainWindow) return;
        // CONVERT DATA TO STRING
        data = data.toString();
        // SEND UPSCAYL PROGRESS TO RENDERER
        mainWindow.webContents.send(COMMAND.DOUBLE_UPSCAYL_PROGRESS, data);
        // IF PROGRESS HAS ERROR, UPSCAYL FAILED
        if (data.includes("invalid gpu") || data.includes("failed")) {
          upscayl2.kill();
          failed2 = true;
        }
      });
      upscayl2.process.on("error", (data) => {
        if (!mainWindow) return;
        data.toString();
        // SEND UPSCAYL PROGRESS TO RENDERER
        mainWindow.webContents.send(COMMAND.DOUBLE_UPSCAYL_PROGRESS, data);
        // SET FAILED TO TRUE
        failed2 = true;
        mainWindow &&
          mainWindow.webContents.send(
            COMMAND.UPSCAYL_ERROR,
            "Error upscaling image. Error: " + data
          );
        upscayl2.kill();
        return;
      });
      upscayl2.process.on("close", onClose2);
    }
  });
};

export default doubleUpscayl;
