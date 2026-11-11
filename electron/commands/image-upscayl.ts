import fs from "fs";
import { modelsPath } from "../utils/get-resource-paths";
import { ELECTRON_COMMANDS } from "../../common/electron-commands";
import {
  savedCustomModelsPath,
  setChildProcesses,
  setStopped,
  stopped,
} from "../utils/config-variables";
import { getSingleImageArguments } from "../utils/get-arguments";
import logit from "../utils/logit";
import slash from "../utils/slash";
import { spawnUpscayl } from "../utils/spawn-upscayl";
import { parse } from "path";
import { getMainWindow } from "../main-window";
import { checkUpscalePayload } from "../utils/check-upscale-payload";
import { ImageUpscaylPayload } from "../../common/types/types";
import { ImageFormat } from "../types/types";
import showNotification from "../utils/show-notification";
import getFilenameFromPath from "../../common/get-file-name";
import decodePath from "../../common/decode-path";
import getDirectoryFromPath from "../../common/get-directory-from-path";
import { isBundledModel } from "../../common/models-list";
import { getPlatform } from "../utils/get-device-specs";
import { copyMetadata } from "../utils/copy-metadata";

const imageUpscayl = async (event, payload: ImageUpscaylPayload) => {
  const mainWindow = getMainWindow();

  if (!mainWindow) {
    logit("No main window found");
    return;
  }

  // A Stop pressed while the files are being checked still has to cancel this run, so the flag is cleared
  // before the check and looked at after it.
  setStopped(false);
  const problem = await checkUpscalePayload(payload, "image");
  if (stopped || mainWindow.isDestroyed()) return;
  if (problem) {
    logit("Refused an upscale request: ", problem);
    mainWindow.webContents.send(
      ELECTRON_COMMANDS.UPSCAYL_ERROR,
      `Invalid request: ${problem}`,
    );
    return;
  }

  // GET VARIABLES
  const tileSize = payload.tileSize;
  const compression = payload.compression;
  const ttaMode = payload.ttaMode;
  const scale = payload.scale;
  const useCustomWidth = payload.useCustomWidth;
  const customWidth = useCustomWidth ? payload.customWidth : "";
  const model = payload.model as string;
  const gpuId = payload.gpuId as string;
  const saveImageAs = payload.saveImageAs as ImageFormat;
  const overwrite = payload.overwrite as boolean;
  const imagePath = decodePath(payload.imagePath);
  let inputDir = getDirectoryFromPath(imagePath);
  let outputDir = decodePath(payload.outputPath);
  const fileNameWithExt = getFilenameFromPath(imagePath);
  const fileName = parse(fileNameWithExt).name;

  const outFile =
    outputDir +
    slash +
    fileName +
    "_upscayl_" +
    (useCustomWidth ? `${customWidth}px_` : `${scale}x_`) +
    model +
    "." +
    saveImageAs;

  const isDefaultModel = isBundledModel(model);

  // Check if filename is too long
  if (outFile.length >= 255) {
    if (getPlatform() === "win") {
      logit("Filename too long for Windows.");
      mainWindow.webContents.send(
        ELECTRON_COMMANDS.UPSCAYL_ERROR,
        "The filename exceeds the maximum path length allowed by Windows. Please shorten the filename or choose a different save location.",
      );
    } else {
      mainWindow.webContents.send(
        ELECTRON_COMMANDS.UPSCAYL_WARNING,
        "The output filename exceeds 255 characters, which is over the max path length allowed by Windows, though your OS supports it. Please consider shortening the filename next time.",
      );
    }
  }

  // UPSCALE
  if (fs.existsSync(outFile) && !overwrite) {
    // If already upscayled, just output that file
    logit("✅ Already upscayled at: ", outFile);
    mainWindow.webContents.send(ELECTRON_COMMANDS.UPSCAYL_DONE, outFile);
  } else {
    logit(
      "✅ Upscayl Variables: ",
      JSON.stringify({
        model,
        gpuId,
        saveImageAs,
        inputDir,
        fileNameWithExt,
        outputDir,
        outFile,
        fileName,
        scale,
        compression,
        customWidth,
        useCustomWidth,
        tileSize,
      }),
    );
    const upscayl = spawnUpscayl(
      getSingleImageArguments({
        inputDir,
        fileNameWithExt,
        outFile,
        modelsPath: isDefaultModel
          ? modelsPath
          : (savedCustomModelsPath ?? modelsPath),
        model,
        scale,
        gpuId,
        saveImageAs,
        customWidth,
        compression,
        tileSize,
        ttaMode,
      }),
      logit,
    );

    setChildProcesses(upscayl);

    setStopped(false);
    let failed = false;

    const onData = (data: string) => {
      logit(data.toString());
      mainWindow.setProgressBar(parseFloat(data.slice(0, data.length)) / 100);
      data = data.toString();
      mainWindow.webContents.send(
        ELECTRON_COMMANDS.UPSCAYL_PROGRESS,
        data.toString(),
      );
      if (data.includes("Error") || data.includes("failed")) {
        upscayl.kill();
        failed = true;
        onError(data);
      } else if (data.includes("Resizing")) {
        mainWindow.webContents.send(ELECTRON_COMMANDS.SCALING_AND_CONVERTING);
      }
    };
    const onError = (data) => {
      if (!mainWindow) return;
      mainWindow.setProgressBar(-1);
      mainWindow.webContents.send(
        ELECTRON_COMMANDS.UPSCAYL_ERROR,
        data.toString(),
      );
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
        if (payload.copyMetadata) {
          logit("🏷️ Copying metadata...");
          try {
            await copyMetadata(imagePath, outFile);
            logit("✅ Metadata copied to: ", outFile);
          } catch (error) {
            logit("❌ Error copying metadata: ", error);
            mainWindow.webContents.send(
              ELECTRON_COMMANDS.METADATA_ERROR,
              error,
            );
          }
        }
        mainWindow.webContents.send(ELECTRON_COMMANDS.UPSCAYL_DONE, outFile);
        showNotification("Upscayl", "Image upscayled successfully!");
      }
    };

    upscayl.process.stderr.on("data", onData);
    upscayl.process.on("error", onError);
    upscayl.process.on("close", onClose);
  }
};

export default imageUpscayl;
