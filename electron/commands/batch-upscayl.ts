import fs from "fs";
import { getMainWindow } from "../main-window";
import {
  childProcesses,
  savedCustomModelsPath,
  setStopped,
  stopped,
} from "../utils/config-variables";
import logit from "../utils/logit";
import { spawnUpscayl } from "../utils/spawn-upscayl";
import { getBatchArguments } from "../utils/get-arguments";
import slash from "../utils/slash";
import { modelsPath } from "../utils/get-resource-paths";
import { ELECTRON_COMMANDS } from "../../common/electron-commands";
import { BatchUpscaylPayload } from "../../common/types/types";
import showNotification from "../utils/show-notification";
import { MODELS } from "../../common/models-list";
import getDirectoriesAndSubDirectories from "../utils/get-rdirectories";

const batchUpscayl = async (event, payload: BatchUpscaylPayload) => {
  const mainWindow = getMainWindow();
  if (!mainWindow) return;

  const tileSize = payload.tileSize;
  const compression = payload.compression;
  const ttaMode = payload.ttaMode;
  const scale = payload.scale;
  const useCustomWidth = payload.useCustomWidth;
  const customWidth = useCustomWidth ? payload.customWidth : "";
  const model = payload.model;
  const gpuId = payload.gpuId;
  const saveImageAs = payload.saveImageAs;
  // GET THE IMAGE DIRECTORY
  let inputDir = decodeURIComponent(payload.batchFolderPath);
  // GET ALL GET ALL DIRECTORIES
  const directories = getDirectoriesAndSubDirectories(inputDir);

  const upScaleImagesOfDirectories = (inputDir) => {
    // GET THE OUTPUT DIRECTORY
    // TODO return the output folder (this only for test purpose) // please if you find this consiter I've forgot the return actuale parameter

    // let outputFolderPath = decodeURIComponent(payload.outputPath);
    let outputFolderPath = decodeURIComponent(inputDir);
    // don't forget to return the output folder 

    const outputFolderName = `upscayl_${saveImageAs}_${model}_${useCustomWidth ? `${customWidth}px` : `${scale}x`
      }`;
    outputFolderPath += slash + outputFolderName;
    // CREATE THE OUTPUT DIRECTORY
    if (!fs.existsSync(outputFolderPath)) {
      fs.mkdirSync(outputFolderPath, { recursive: true });
    }

    const currentIndex = directories.indexOf(inputDir)

    const isDefaultModel = model in MODELS;

    // UPSCALE
    const upscayl = spawnUpscayl(
      getBatchArguments({
        inputDir,
        outputDir: outputFolderPath,
        modelsPath: isDefaultModel
          ? modelsPath
          : (savedCustomModelsPath ?? modelsPath),
        model,
        gpuId,
        saveImageAs,
        scale,
        customWidth,
        compression,
        tileSize,
        ttaMode,
      }),
      logit,
    );

    childProcesses.push(upscayl);

    setStopped(false);
    let failed = false;
    let encounteredError = false;

    const onData = (data: any) => {
      if (!mainWindow) return;
      data = data.toString();
      mainWindow.webContents.send(
        ELECTRON_COMMANDS.FOLDER_UPSCAYL_PROGRESS,
        data.toString(),
      );
      if (
        (data as string).includes("Error") ||
        (data as string).includes("failed")
      ) {
        logit("❌ ", data);
        encounteredError = true;
        onError(data);
      } else if (data.includes("Resizing")) {
        mainWindow.webContents.send(ELECTRON_COMMANDS.SCALING_AND_CONVERTING);
      }
    };
    const onError = (data: any) => {
      if (!mainWindow) return;
      mainWindow.setProgressBar(-1);
      mainWindow.webContents.send(
        ELECTRON_COMMANDS.FOLDER_UPSCAYL_PROGRESS,
        data.toString(),
      );
      failed = true;
      upscayl.kill();
      mainWindow &&
        mainWindow.webContents.send(
          ELECTRON_COMMANDS.UPSCAYL_ERROR,
          `Error upscaling images! ${data}`,
        );
      return;
    };
    const onClose = () => {
      if (!mainWindow) return;
      if (!failed && !stopped) {
        logit("💯 Done upscaling");
        upscayl.kill();
        if(currentIndex == directories.length - 1)
          mainWindow.webContents.send(
            ELECTRON_COMMANDS.FOLDER_UPSCAYL_DONE,
            outputFolderPath,
          );
        if (!encounteredError) {
          showNotification("Upscayled", "Images upscayled successfully!");
        } else {
          showNotification(
            "Upscayled",
            "Images were upscayled but encountered some errors!",
          );
        }
      } else {
        upscayl.kill();
      }
    if(currentIndex >= 0 && currentIndex < directories.length - 1)
      upScaleImagesOfDirectories(directories[currentIndex + 1]);
    };
    upscayl.process.stderr.on("data", onData);
    upscayl.process.on("error", onError);
    upscayl.process.on("close", onClose);
  }

  if(directories.length === 0)
    upScaleImagesOfDirectories(inputDir);
  else
    upScaleImagesOfDirectories(directories[0]);
};

export default batchUpscayl;
