import path, { parse } from "path";
import { getMainWindow } from "../main-window";
import {
  childProcesses,
  savedCustomModelsPath,
  savedOutputPath,
  rememberOutputFolder,
  setCompression,
  setNoImageProcessing,
  setStopped,
  stopped,
} from "../utils/config-variables";
import slash from "../utils/slash";
import { spawnUpscayl } from "../utils/spawn-upscayl";
import {
  getDoubleUpscaleArguments,
  getDoubleUpscaleSecondPassArguments,
} from "../utils/get-arguments";
import { modelsPath } from "../utils/get-resource-paths";
import logit from "../utils/logit";
import COMMAND from "../../common/commands";
import { DoubleUpscaylPayload } from "../../common/types/types";
import { ImageFormat } from "../types/types";
import showNotification from "../utils/show-notification";
import { DEFAULT_MODELS } from "../../common/models-list";

const doubleUpscayl = async (event, payload: DoubleUpscaylPayload) => {
  const mainWindow = getMainWindow();
  if (!mainWindow) return;

  const model = payload.model as string;
  const imagePath = payload.imagePath;
  let inputDir = (imagePath.match(/(.*)[\/\\]/) || [""])[1];
  let outputDir = path.normalize(payload.outputPath);

  if (rememberOutputFolder === true && savedOutputPath) {
    outputDir = savedOutputPath;
  }
  const gpuId = payload.gpuId as string;
  const saveImageAs = payload.saveImageAs as ImageFormat;

  setNoImageProcessing(payload.noImageProcessing);
  setCompression(parseInt(payload.compression));

  const isDefaultModel = DEFAULT_MODELS.includes(model);

  // COPY IMAGE TO TMP FOLDER

  const fullfileName = imagePath.split(slash).slice(-1)[0] as string;
  const fileName = parse(fullfileName).name;

  const scale = parseInt(payload.scale) * parseInt(payload.scale);
  const useCustomWidth = payload.useCustomWidth;
  const customWidth = useCustomWidth ? payload.customWidth : "";

  const outFile =
    outputDir +
    slash +
    fileName +
    "_upscayl_" +
    (useCustomWidth ? `${customWidth}px_` : `${scale}x_`) +
    model +
    "." +
    saveImageAs;

  // UPSCALE
  let upscayl = spawnUpscayl(
    getDoubleUpscaleArguments({
      inputDir,
      fullfileName,
      outFile,
      modelsPath: isDefaultModel
        ? modelsPath
        : savedCustomModelsPath ?? modelsPath,
      model,
      gpuId,
      saveImageAs,
    }),
    logit,
  );

  let upscayl2: ReturnType<typeof spawnUpscayl>;

  childProcesses.push(upscayl);

  setStopped(false);
  let failed = false;
  let failed2 = false;

  // SECOND PASS FUNCTIONS
  const onError2 = (data) => {
    if (!mainWindow) return;
    data.toString();
    // SEND UPSCAYL PROGRESS TO RENDERER
    mainWindow.webContents.send(COMMAND.DOUBLE_UPSCAYL_PROGRESS, data);
    // SET FAILED TO TRUE
    failed2 = true;
    mainWindow &&
      mainWindow.webContents.send(
        COMMAND.UPSCAYL_ERROR,
        "Error upscaling image. Error: " + data,
      );
    showNotification("Upscayl Failure", "Failed to upscale image!");
    upscayl2.kill();
    return;
  };

  const onData2 = (data) => {
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
  };

  const onClose2 = async (code) => {
    if (!mainWindow) return;
    if (!failed2 && !stopped) {
      logit("💯 Done upscaling");

      mainWindow.setProgressBar(-1);
      mainWindow.webContents.send(
        COMMAND.DOUBLE_UPSCAYL_DONE,
        outFile.replace(
          /([^/\\]+)$/i,
          encodeURIComponent(outFile.match(/[^/\\]+$/i)![0]),
        ),
      );
      showNotification("Upscayled", "Image upscayled successfully!");
    }
  };

  // FIRST PASS FUNCTIONS
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
        "Error upscaling image. Error: " + data,
      );
    showNotification("Upscayl Failure", "Failed to upscale image!");
    upscayl.kill();
    return;
  };

  const onData = (data) => {
    if (!mainWindow) return;
    // CONVERT DATA TO STRING
    data = data.toString();
    // SEND UPSCAYL PROGRESS TO RENDERER
    mainWindow.webContents.send(COMMAND.DOUBLE_UPSCAYL_PROGRESS, data);
    // IF PROGRESS HAS ERROR, UPSCAYL FAILED
    if (data.includes("Error") || data.includes("failed")) {
      upscayl.kill();
      failed = true;
    } else if (data.includes("Resizing")) {
      mainWindow.webContents.send(COMMAND.SCALING_AND_CONVERTING);
    }
  };

  const onClose = (code) => {
    // IF NOT FAILED
    if (!failed && !stopped) {
      // SPAWN A SECOND PASS
      upscayl2 = spawnUpscayl(
        getDoubleUpscaleSecondPassArguments({
          outFile,
          modelsPath: isDefaultModel
            ? modelsPath
            : savedCustomModelsPath ?? modelsPath,
          model,
          gpuId,
          saveImageAs,
          scale: scale.toString(),
          customWidth,
        }),
        logit,
      );
      childProcesses.push(upscayl2);
      upscayl2.process.stderr.on("data", onData2);
      upscayl2.process.on("error", onError2);
      upscayl2.process.on("close", onClose2);
    }
  };

  upscayl.process.stderr.on("data", onData);
  upscayl.process.on("error", onError);
  upscayl.process.on("close", onClose);
};

export default doubleUpscayl;
