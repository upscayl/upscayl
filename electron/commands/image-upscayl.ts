import fs from "fs";
import { modelsPath } from "../utils/get-resource-paths";
import COMMAND from "../../common/commands";
import {
  savedCompression,
  savedCustomModelsPath,
  savedBatchUpscaylFolderPath,
  savedOutputPath,
  rememberOutputFolder,
  setChildProcesses,
  setCompression,
  setNoImageProcessing,
  setStopped,
  stopped,
} from "../utils/config-variables";
import { getSingleImageArguments } from "../utils/get-arguments";
import logit from "../utils/logit";
import slash from "../utils/slash";
import { spawnUpscayl } from "../utils/spawn-upscayl";
import { parse } from "path";
import { getMainWindow } from "../main-window";
import { ImageUpscaylPayload } from "../../common/types/types";
import { ImageFormat } from "../types/types";
import showNotification from "../utils/show-notification";
import { DEFAULT_MODELS } from "../../common/models-list";

const imageUpscayl = async (event, payload: ImageUpscaylPayload) => {
  const mainWindow = getMainWindow();

  if (!mainWindow) {
    logit("No main window found");
    return;
  }

  setNoImageProcessing(payload.noImageProcessing);
  setCompression(parseInt(payload.compression));

  // GET VARIABLES
  const model = payload.model as string;
  const gpuId = payload.gpuId as string;
  const saveImageAs = payload.saveImageAs as ImageFormat;
  const overwrite = payload.overwrite as boolean;
  let inputDir = (payload.imagePath.match(/(.*)[\/\\]/)?.[1] || "") as string;
  let outputDir: string | undefined =
    savedBatchUpscaylFolderPath || (payload.outputPath as string);
  if (
    rememberOutputFolder === true &&
    savedOutputPath &&
    savedOutputPath?.length > 0
  ) {
    logit("🧠 Using saved output path");
    outputDir = savedOutputPath;
  }
  const isDefaultModel = DEFAULT_MODELS.includes(model);
  logit("Is Default Model? : ", isDefaultModel);
  const fullfileName = payload.imagePath.replace(/^.*[\\\/]/, "") as string;
  const fileName = parse(fullfileName).name;
  const fileExt = parse(fullfileName).ext;
  const useCustomWidth = payload.useCustomWidth;
  const customWidth = useCustomWidth ? payload.customWidth : "";

  const scale = payload.scale;

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
  if (fs.existsSync(outFile) && !overwrite) {
    // If already upscayled, just output that file
    logit("✅ Already upscayled at: ", outFile);
    mainWindow.webContents.send(
      COMMAND.UPSCAYL_DONE,
      outFile.replace(
        /([^/\\]+)$/i,
        encodeURIComponent(outFile.match(/[^/\\]+$/i)![0]),
      ),
    );
  } else {
    logit(
      "✅ Upscayl Variables: ",
      JSON.stringify({
        model,
        gpuId,
        saveImageAs,
        inputDir,
        outputDir,
        fullfileName,
        fileName,
        scale,
        outFile,
        compression: savedCompression,
      }),
    );
    const upscayl = spawnUpscayl(
      getSingleImageArguments({
        inputDir,
        fullfileName,
        outFile,
        modelsPath: isDefaultModel
          ? modelsPath
          : savedCustomModelsPath ?? modelsPath,
        model,
        scale,
        gpuId,
        saveImageAs,
        customWidth,
      }),
      logit,
    );

    setChildProcesses(upscayl);

    setStopped(false);
    let isAlpha = false;
    let failed = false;

    const onData = (data: string) => {
      logit(data.toString());
      mainWindow.setProgressBar(parseFloat(data.slice(0, data.length)) / 100);
      data = data.toString();
      mainWindow.webContents.send(COMMAND.UPSCAYL_PROGRESS, data.toString());
      if (data.includes("invalid gpu") || data.includes("failed")) {
        upscayl.kill();
        failed = true;
      } else if (data.includes("Resizing")) {
        mainWindow.webContents.send(COMMAND.SCALING_AND_CONVERTING);
      }
    };
    const onError = (data) => {
      if (!mainWindow) return;
      mainWindow.setProgressBar(-1);
      mainWindow.webContents.send(COMMAND.UPSCAYL_ERROR, data.toString());
      failed = true;
      upscayl.kill();
      return;
    };
    const onClose = async () => {
      if (!failed && !stopped) {
        logit("💯 Done upscaling");
        // Free up memory
        upscayl.kill();
        mainWindow.setProgressBar(-1);
        mainWindow.webContents.send(
          COMMAND.UPSCAYL_DONE,
          outFile.replace(
            /([^/\\]+)$/i,
            encodeURIComponent(outFile.match(/[^/\\]+$/i)![0]),
          ),
        );
        showNotification("Upscayl", "Image upscayled successfully!");
      }
    };

    upscayl.process.stderr.on("data", onData);
    upscayl.process.on("error", onError);
    upscayl.process.on("close", onClose);
  }
};

export default imageUpscayl;
