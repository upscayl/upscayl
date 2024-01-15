import fs, { rmdir } from "fs";
import { getMainWindow } from "../main-window";
import {
  childProcesses,
  customModelsFolderPath,
  noImageProcessing,
  outputFolderPath,
  saveOutputFolder,
  setCompression,
  setNoImageProcessing,
  setStopped,
  stopped,
} from "../utils/config-variables";
import logit from "../utils/logit";
import { spawnUpscayl } from "../utils/spawn-upscayl";
import { getBatchArguments } from "../utils/get-arguments";
import slash from "../utils/slash";
import { modelsPath } from "../utils/get-resource-paths";
import COMMAND from "../constants/commands";
import convertAndScale from "../utils/convert-and-scale";
import DEFAULT_MODELS from "../constants/models";
import { BatchUpscaylPayload } from "../../common/types/types";
import { ImageFormat } from "../utils/types";

const batchUpscayl = async (event, payload: BatchUpscaylPayload) => {
  const mainWindow = getMainWindow();
  if (!mainWindow) return;
  // GET THE MODEL
  const model = payload.model;
  const gpuId = payload.gpuId;
  const saveImageAs = payload.saveImageAs as ImageFormat;

  // GET THE IMAGE DIRECTORY
  let inputDir = payload.batchFolderPath;
  // GET THE OUTPUT DIRECTORY
  let outputDir = payload.outputPath;
  if (saveOutputFolder === true && outputFolderPath) {
    outputDir = outputFolderPath;
  }

  setNoImageProcessing(payload.noImageProcessing);
  setCompression(parseInt(payload.compression));

  const isDefaultModel = DEFAULT_MODELS.includes(model);

  let initialScale = "4";
  if (model.includes("x1")) {
    initialScale = "1";
  } else if (model.includes("x2")) {
    initialScale = "2";
  } else if (model.includes("x3")) {
    initialScale = "3";
  } else {
    initialScale = "4";
  }
  const desiredScale = payload.scale as string;

  outputDir +=
    slash +
    `upscayl_${model}_x${noImageProcessing ? initialScale : desiredScale}`;
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Delete .DS_Store files
  fs.readdirSync(inputDir).forEach((file) => {
    if (file === ".DS_Store") {
      logit("🗑️ Deleting .DS_Store file");
      fs.unlinkSync(inputDir + slash + file);
    }
  });

  // UPSCALE
  const upscayl = spawnUpscayl(
    "realesrgan",
    getBatchArguments(
      inputDir,
      outputDir,
      isDefaultModel ? modelsPath : customModelsFolderPath ?? modelsPath,
      model,
      gpuId,
      "png",
      initialScale
    ),
    logit
  );

  childProcesses.push(upscayl);

  setStopped(false);
  let failed = false;

  const onData = (data: any) => {
    if (!mainWindow) return;
    data = data.toString();
    mainWindow.webContents.send(
      COMMAND.FOLDER_UPSCAYL_PROGRESS,
      data.toString()
    );
    if (data.includes("invalid") || data.includes("failed")) {
      logit("❌ INVALID GPU OR INVALID FILES IN FOLDER - FAILED");
      failed = true;
      upscayl.kill();
    }
  };
  const onError = (data: any) => {
    if (!mainWindow) return;
    mainWindow.setProgressBar(-1);
    mainWindow.webContents.send(
      COMMAND.FOLDER_UPSCAYL_PROGRESS,
      data.toString()
    );
    failed = true;
    upscayl.kill();
    mainWindow &&
      mainWindow.webContents.send(
        COMMAND.UPSCAYL_ERROR,
        "Error upscaling image. Error: " + data
      );
    return;
  };
  const onClose = () => {
    if (!mainWindow) return;
    if (!failed && !stopped) {
      logit("💯 Done upscaling");
      logit("♻ Scaling and converting now...");
      upscayl.kill();
      mainWindow && mainWindow.webContents.send(COMMAND.SCALING_AND_CONVERTING);
      if (noImageProcessing) {
        logit("🚫 Skipping scaling and converting");
        mainWindow.setProgressBar(-1);
        mainWindow.webContents.send(COMMAND.FOLDER_UPSCAYL_DONE, outputDir);
        return;
      }

      const files = fs.readdirSync(inputDir);
      try {
        files.forEach(async (file) => {
          console.log("Filename: ", file.slice(0, -3));
          await convertAndScale(
            inputDir + slash + file,
            outputDir + slash + file.slice(0, -3) + "png",
            outputDir + slash + file.slice(0, -3) + saveImageAs,
            desiredScale,
            saveImageAs,
            onError
          );
          // Remove the png file (default) if the saveImageAs is not png
          if (saveImageAs !== "png") {
            logit("Removing output PNG");
            fs.unlinkSync(outputDir + slash + file.slice(0, -3) + "png");
          }
        });
        mainWindow.webContents.send(COMMAND.FOLDER_UPSCAYL_DONE, outputDir);
      } catch (error) {
        logit("❌ Error processing (scaling and converting) the image.", error);
        upscayl.kill();
        mainWindow &&
          mainWindow.webContents.send(
            COMMAND.UPSCAYL_ERROR,
            "Error processing (scaling and converting) the image. Please report this error on Upscayl GitHub Issues page.\n" +
              error
          );
      }
    } else {
      upscayl.kill();
    }
  };
  upscayl.process.stderr.on("data", onData);
  upscayl.process.on("error", onError);
  upscayl.process.on("close", onClose);
};

export default batchUpscayl;
