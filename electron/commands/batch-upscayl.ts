import fs from "fs";
import { getMainWindow } from "../main-window";
import {
  childProcesses,
  customModelsFolderPath,
  noImageProcessing,
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
import getModelScale from "../../common/check-model-scale";
import removeFileExtension from "../utils/remove-file-extension";
import showNotification from "../utils/show-notification";

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
  let outputFolderPath = payload.outputPath;
  if (saveOutputFolder === true && outputFolderPath) {
    outputFolderPath = outputFolderPath;
  }

  setNoImageProcessing(payload.noImageProcessing);
  setCompression(parseInt(payload.compression));

  const isDefaultModel = DEFAULT_MODELS.includes(model);

  let initialScale = getModelScale(model);

  const desiredScale = payload.scale as string;

  const outputFolderName = `upscayl_${model}_x${
    noImageProcessing ? initialScale : desiredScale
  }`;
  outputFolderPath += slash + outputFolderName;
  if (!fs.existsSync(outputFolderPath)) {
    fs.mkdirSync(outputFolderPath, { recursive: true });
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
      outputFolderPath,
      isDefaultModel ? modelsPath : customModelsFolderPath ?? modelsPath,
      model,
      gpuId,
      saveImageAs,
      initialScale
    ),
    logit
  );

  childProcesses.push(upscayl);

  setStopped(false);
  let failed = false;
  let isAlpha = false;

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
    if (data.includes("has alpha channel")) {
      isAlpha = true;
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
        mainWindow.webContents.send(
          COMMAND.FOLDER_UPSCAYL_DONE,
          outputFolderPath
        );
        return;
      }

      const files = fs.readdirSync(inputDir);
      try {
        files.forEach(async (file) => {
          if (file.startsWith(".") || file === outputFolderName) return;
          console.log("Filename: ", removeFileExtension(file));
          await convertAndScale(
            inputDir + slash + file,
            isAlpha
              ? `${outputFolderPath}${slash}${removeFileExtension(file)}.png`
              : `${outputFolderPath}${slash}${removeFileExtension(
                  file
                )}.${saveImageAs}`,
            `${outputFolderPath}${slash}${removeFileExtension(
              file
            )}.${saveImageAs}`,
            desiredScale,
            saveImageAs,
            onError
          );
        });
        mainWindow.webContents.send(
          COMMAND.FOLDER_UPSCAYL_DONE,
          outputFolderPath
        );
        showNotification("Upscayled", "Image upscayled successfully!");
      } catch (error) {
        logit("❌ Error processing (scaling and converting) the image.", error);
        upscayl.kill();
        mainWindow &&
          mainWindow.webContents.send(
            COMMAND.UPSCAYL_ERROR,
            "Error processing (scaling and converting) the image. Please report this error on Upscayl GitHub Issues page.\n" +
              error
          );
        showNotification("Upscayl Failure", "Failed to upscale image!");
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
