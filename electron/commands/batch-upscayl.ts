import fs from "fs";
import { getMainWindow } from "../main-window";
import {
  childProcesses,
  savedCustomModelsPath,
  noImageProcessing,
  rememberOutputFolder,
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
import COMMAND from "../../common/commands";
import { BatchUpscaylPayload } from "../../common/types/types";
import { ImageFormat } from "../utils/types";
import showNotification from "../utils/show-notification";
import { DEFAULT_MODELS } from "../../common/models-list";

const batchUpscayl = async (event, payload: BatchUpscaylPayload) => {
  const mainWindow = getMainWindow();
  if (!mainWindow) return;
  // GET THE MODEL
  const model = payload.model;
  const gpuId = payload.gpuId;
  const saveImageAs = payload.saveImageAs as ImageFormat;
  console.log("PAYLOAD: ", payload);
  // GET THE IMAGE DIRECTORY
  let inputDir = payload.batchFolderPath;
  // GET THE OUTPUT DIRECTORY
  let outputFolderPath = payload.outputPath;
  if (rememberOutputFolder === true && outputFolderPath) {
    outputFolderPath = outputFolderPath;
  }
  // ! Don't do fetchLocalStorage() again, it causes the values to be reset
  setNoImageProcessing(payload.noImageProcessing);
  setCompression(parseInt(payload.compression));

  const isDefaultModel = DEFAULT_MODELS.includes(model);

  const scale = payload.scale;
  const useCustomWidth = payload.useCustomWidth;
  const customWidth = useCustomWidth ? payload.customWidth : "";

  const outputFolderName = `upscayl_${saveImageAs}_${model}_${scale ? scale : ""}${useCustomWidth ? "px" : "x"}`;

  outputFolderPath += slash + outputFolderName;
  if (!fs.existsSync(outputFolderPath)) {
    fs.mkdirSync(outputFolderPath, { recursive: true });
  }

  // Delete .DS_Store files
  fs.readdirSync(inputDir).forEach((file) => {
    if (
      file === ".DS_Store" ||
      file.toLowerCase() === "desktop.ini" ||
      file.startsWith(".")
    ) {
      logit("🗑️ Deleting .DS_Store file");
      fs.unlinkSync(inputDir + slash + file);
    }
  });

  // UPSCALE
  const upscayl = spawnUpscayl(
    getBatchArguments({
      inputDir,
      outputDir: outputFolderPath,
      modelsPath: isDefaultModel
        ? modelsPath
        : savedCustomModelsPath ?? modelsPath,
      model,
      gpuId,
      saveImageAs,
      scale,
      customWidth,
    }),
    logit,
  );

  childProcesses.push(upscayl);

  setStopped(false);
  let failed = false;

  const onData = (data: any) => {
    if (!mainWindow) return;
    data = data.toString();
    mainWindow.webContents.send(
      COMMAND.FOLDER_UPSCAYL_PROGRESS,
      data.toString(),
    );
    if ((data as string).includes("Error")) {
      logit("❌ ", data);
      failed = true;
      upscayl.kill();
    } else if (data.includes("Resizing")) {
      mainWindow.webContents.send(COMMAND.SCALING_AND_CONVERTING);
    }
  };
  const onError = (data: any) => {
    if (!mainWindow) return;
    mainWindow.setProgressBar(-1);
    mainWindow.webContents.send(
      COMMAND.FOLDER_UPSCAYL_PROGRESS,
      data.toString(),
    );
    failed = true;
    upscayl.kill();
    mainWindow &&
      mainWindow.webContents.send(
        COMMAND.UPSCAYL_ERROR,
        `Error upscaling image! ${data}`,
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
      try {
        mainWindow.webContents.send(
          COMMAND.FOLDER_UPSCAYL_DONE,
          outputFolderPath,
        );
        showNotification("Upscayled", "Image upscayled successfully!");
      } catch (error) {
        logit("❌ Error processing (scaling and converting) the image.", error);
        upscayl.kill();
        mainWindow &&
          mainWindow.webContents.send(
            COMMAND.UPSCAYL_ERROR,
            "Error processing (scaling and converting) the image. Please report this error on Upscayl GitHub Issues page.\n" +
              error,
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
