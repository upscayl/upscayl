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
import COMMAND from "../../common/commands";
import { BatchUpscaylPayload } from "../../common/types/types";
import showNotification from "../utils/show-notification";
import { DEFAULT_MODELS } from "../../common/models-list";

const batchUpscayl = async (event, payload: BatchUpscaylPayload) => {
  const mainWindow = getMainWindow();
  if (!mainWindow) return;

  const scale = payload.scale;
  const useCustomWidth = payload.useCustomWidth;
  const customWidth = useCustomWidth ? payload.customWidth : "";
  const model = payload.model;
  const gpuId = payload.gpuId;
  const saveImageAs = payload.saveImageAs;
  // GET THE IMAGE DIRECTORY
  let inputDir = decodeURIComponent(payload.batchFolderPath);
  // GET THE OUTPUT DIRECTORY
  let outputFolderPath = decodeURIComponent(payload.outputPath);
  const outputFolderName = `upscayl_${saveImageAs}_${model}_${
    useCustomWidth ? `${customWidth}px` : `${scale}x`
  }`;
  outputFolderPath += slash + outputFolderName;
  // CREATE THE OUTPUT DIRECTORY
  if (!fs.existsSync(outputFolderPath)) {
    fs.mkdirSync(outputFolderPath, { recursive: true });
  }

  const isDefaultModel = DEFAULT_MODELS.includes(model);

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
  let encounteredError = false;

  const onData = (data: any) => {
    if (!mainWindow) return;
    data = data.toString();
    mainWindow.webContents.send(
      COMMAND.FOLDER_UPSCAYL_PROGRESS,
      data.toString(),
    );
    if ((data as string).includes("Error")) {
      logit("❌ ", data);
      encounteredError = true;
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
        `Error upscaling images! ${data}`,
      );
    return;
  };
  const onClose = () => {
    if (!mainWindow) return;
    if (!failed && !stopped) {
      logit("💯 Done upscaling");
      upscayl.kill();
      mainWindow.webContents.send(
        COMMAND.FOLDER_UPSCAYL_DONE,
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
  };
  upscayl.process.stderr.on("data", onData);
  upscayl.process.on("error", onError);
  upscayl.process.on("close", onClose);
};

export default batchUpscayl;
