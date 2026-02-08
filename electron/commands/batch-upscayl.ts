import fs from "fs";
import path from "path";
import { getMainWindow } from "../main-window";
import {
  batchPaused,
  childProcesses,
  savedCustomModelsPath,
  setBatchPauseResolve,
  setBatchPaused,
  setStopped,
  stopped,
} from "../utils/config-variables";
import logit from "../utils/logit";
import { spawnUpscayl } from "../utils/spawn-upscayl";
import { getSingleImageArguments } from "../utils/get-arguments";
import { modelsPath } from "../utils/get-resource-paths";
import { ELECTRON_COMMANDS } from "../../common/electron-commands";
import { BatchUpscaylPayload } from "../../common/types/types";
import showNotification from "../utils/show-notification";
import { MODELS } from "../../common/models-list";
import { copyMetadata } from "../utils/copy-metadata";
import { getBatchImagePaths } from "../utils/get-batch-files";
import { ImageFormat } from "../types/types";

function buildOutputPath(
  outputBase: string,
  relativePath: string,
  saveImageAs: ImageFormat,
  model: string,
  scale: string,
  useCustomWidth: boolean,
  customWidth: string,
): string {
  const dir = path.dirname(relativePath);
  const baseName = path.basename(relativePath, path.extname(relativePath));
  const suffix = useCustomWidth
    ? `${customWidth}px_`
    : `${scale}x_`;
  const fileName = `${baseName}_upscayl_${suffix}${model}.${saveImageAs}`;
  const outDir = dir ? path.join(outputBase, dir) : outputBase;
  return path.join(outDir, fileName);
}

const batchUpscayl = async (event, payload: BatchUpscaylPayload) => {
  const mainWindow = getMainWindow();
  if (!mainWindow) return;

  const folderList = payload.batchFolderPaths;
  if (!folderList || folderList.length === 0) {
    mainWindow.webContents.send(
      ELECTRON_COMMANDS.UPSCAYL_ERROR,
      "No folders selected.",
    );
    return;
  }

  const tileSize = payload.tileSize;
  const compression = payload.compression;
  const ttaMode = payload.ttaMode;
  const scale = payload.scale;
  const useCustomWidth = payload.useCustomWidth;
  const customWidth = useCustomWidth ? payload.customWidth : "";
  const model = payload.model;
  const gpuId = payload.gpuId;
  const saveImageAs = payload.saveImageAs;
  const outputBase = decodeURIComponent(payload.outputPath);
  const isDefaultModel = model in MODELS;
  const modelsPathToUse = isDefaultModel
    ? modelsPath
    : (savedCustomModelsPath ?? modelsPath);

  const folderTotal = folderList.length;

  // Total image count across ALL folders (for correct time/size estimates)
  let totalImagesAllFolders = 0;
  for (let fi = 0; fi < folderTotal; fi++) {
    const dir = decodeURIComponent(folderList[fi]);
    totalImagesAllFolders += getBatchImagePaths(dir).length;
  }

  setStopped(false);
  setBatchPaused(false);
  let encounteredError = false;
  /** Sum of elapsed ms for all actually processed images (used for average). */
  let totalElapsedMs = 0;
  /** Number of images we actually ran upscayl on (not skipped). */
  let processedCount = 0;
  /** Average time per image in ms (totalElapsedMs / processedCount). */
  let timePerImageMs = 0;
  let sizePerImageBytes = 0;
  let totalOutputSizeBytes = 0;
  let anyImagesProcessed = false;
  let completedImagesGlobal = 0;

  const sendBatchProgress = (
    completedGlobal: number,
    phase: "calibrating" | "upscaling",
    folderIndex: number,
    currentFolderName?: string,
    currentFileRelativePath?: string,
  ) => {
    if (!mainWindow) return;
    // All counts and estimates are over ALL images from ALL folders (totalImagesAllFolders)
    const remaining = totalImagesAllFolders - completedGlobal;
    const estimatedTimeRemainingMs =
      timePerImageMs > 0 ? remaining * timePerImageMs : 0;
    const estimatedTotalTimeMs =
      timePerImageMs > 0 ? totalImagesAllFolders * timePerImageMs : 0;
    const estimatedRemainingSizeBytes =
      sizePerImageBytes > 0 ? remaining * sizePerImageBytes : 0;
    // Total storage = average size × total images in all folders (not just current folder)
    const estimatedTotalSizeBytes =
      sizePerImageBytes > 0
        ? Math.round(totalImagesAllFolders * sizePerImageBytes)
        : totalOutputSizeBytes;
    mainWindow.webContents.send(ELECTRON_COMMANDS.BATCH_PROGRESS, {
      current: completedGlobal,
      total: totalImagesAllFolders,
      estimatedTimeRemainingMs,
      estimatedTotalTimeMs,
      estimatedTotalSizeBytes,
      phase,
      folderIndex: folderTotal > 1 ? folderIndex + 1 : undefined,
      folderTotal: folderTotal > 1 ? folderTotal : undefined,
      currentFolderName,
      currentFileRelativePath,
    });
  };

  const sendBatchStopped = () => {
    if (mainWindow) {
      mainWindow.setProgressBar(-1);
      mainWindow.webContents.send(ELECTRON_COMMANDS.BATCH_STOPPED);
    }
  };

  for (let folderIndex = 0; folderIndex < folderTotal; folderIndex++) {
    if (stopped) {
      logit("🛑 Batch stopped by user");
      sendBatchStopped();
      return;
    }

    const inputDir = decodeURIComponent(folderList[folderIndex]);
    const effectiveOutputBase = path.join(
      outputBase,
      path.basename(inputDir),
    );

    const relativePaths = getBatchImagePaths(inputDir);
    const total = relativePaths.length;

    if (total === 0) {
      logit("📁 No images in folder, skipping: ", inputDir);
      continue;
    }

    anyImagesProcessed = true;
    let failed = false;
    let completedInFolder = 0;

    sendBatchProgress(completedImagesGlobal, "upscaling", folderIndex);

    for (let i = 0; i < total; i++) {
      if (stopped) {
        logit("🛑 Batch stopped by user");
        sendBatchStopped();
        return;
      }

      while (batchPaused && !stopped) {
        await new Promise<void>((resolve) => {
          setBatchPauseResolve(resolve);
        });
      }
      if (stopped) break;

      const relativePath = relativePaths[i];
      const inputPath = path.join(inputDir, relativePath);
      sendBatchProgress(
        completedImagesGlobal,
        "upscaling",
        folderIndex,
        path.basename(inputDir),
        relativePath,
      );
      const outFile = buildOutputPath(
        effectiveOutputBase,
        relativePath,
        saveImageAs,
        model,
        scale,
        useCustomWidth,
        customWidth,
      );

      if (fs.existsSync(outFile) && !payload.overwrite) {
        try {
          const stat = fs.statSync(outFile);
          totalOutputSizeBytes += stat.size;
          if (sizePerImageBytes === 0) {
            sizePerImageBytes = stat.size;
          } else {
            sizePerImageBytes = Math.round(
              totalOutputSizeBytes / (completedImagesGlobal + 1),
            );
          }
        } catch (_) {}
        completedInFolder++;
        completedImagesGlobal++;
        sendBatchProgress(completedImagesGlobal, "upscaling", folderIndex);
        mainWindow.webContents.send(
          ELECTRON_COMMANDS.FOLDER_UPSCAYL_PROGRESS,
          "Successful\n",
        );
        continue;
      }

      const outDir = path.dirname(outFile);
      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
      }

      const inputDirForFile = path.dirname(inputPath);
      const fileNameWithExt = path.basename(inputPath);

      const upscayl = spawnUpscayl(
        getSingleImageArguments({
          inputDir: inputDirForFile,
          fileNameWithExt,
          outFile,
          modelsPath: modelsPathToUse,
          model,
          scale,
          gpuId: gpuId ?? "",
          saveImageAs,
          customWidth,
          compression,
          tileSize,
          ttaMode,
        }),
        logit,
      );
      childProcesses.push(upscayl);

      const startTime = Date.now();
      const processClosed = new Promise<boolean>((resolve) => {
        const onData = (data: Buffer | string) => {
          if (!mainWindow) return;
          const str = data.toString();
          mainWindow.webContents.send(
            ELECTRON_COMMANDS.FOLDER_UPSCAYL_PROGRESS,
            str,
          );
          if (str.includes("Error") || str.includes("failed")) {
            encounteredError = true;
            logit("❌ ", str);
          } else if (str.includes("Resizing")) {
            mainWindow.webContents.send(ELECTRON_COMMANDS.SCALING_AND_CONVERTING);
          }
        };
        const onError = (data: Buffer | string) => {
          if (!mainWindow) return;
          mainWindow.setProgressBar(-1);
          mainWindow.webContents.send(
            ELECTRON_COMMANDS.FOLDER_UPSCAYL_PROGRESS,
            data.toString(),
          );
          failed = true;
          upscayl.kill();
          mainWindow.webContents.send(
            ELECTRON_COMMANDS.UPSCAYL_ERROR,
            `Error upscaling images! ${data}`,
          );
          resolve(false);
        };
        const onClose = () => {
          resolve(!failed);
        };
        upscayl.process.stderr.on("data", onData);
        upscayl.process.on("error", (err) => onError(String(err)));
        upscayl.process.on("close", onClose);
      });

      const success = await processClosed;
      upscayl.kill();

      if (!success) {
        sendBatchStopped();
        return;
      }
      if (stopped) {
        sendBatchStopped();
        return;
      }

      completedInFolder++;
      completedImagesGlobal++;
      const elapsedMs = Date.now() - startTime;
      // Average time per image = sum of all elapsed times / number of processed images
      totalElapsedMs += elapsedMs;
      processedCount++;
      timePerImageMs = Math.round(totalElapsedMs / processedCount);
      if (fs.existsSync(outFile)) {
        try {
          const stat = fs.statSync(outFile);
          totalOutputSizeBytes += stat.size;
        } catch (_) {}
      }
      // Average size = total output so far / all completed images (processed + skipped)
      sizePerImageBytes =
        completedImagesGlobal > 0
          ? Math.round(totalOutputSizeBytes / completedImagesGlobal)
          : sizePerImageBytes || 0;

      sendBatchProgress(completedImagesGlobal, "upscaling", folderIndex);

      if (payload.copyMetadata) {
        try {
          await copyMetadata(inputPath, outFile);
          logit("✅ Metadata copied to: ", outFile);
        } catch (err) {
          logit("❌ Error copying metadata: ", err);
          mainWindow.webContents.send(
            ELECTRON_COMMANDS.METADATA_ERROR,
            err,
          );
        }
      }
    }

    if (stopped) break;
  }

  if (stopped) {
    sendBatchStopped();
    return;
  }

  if (!anyImagesProcessed) {
    if (mainWindow) mainWindow.setProgressBar(-1);
    mainWindow?.webContents.send(
      ELECTRON_COMMANDS.UPSCAYL_ERROR,
      "No image files found in any of the selected folders (including subfolders). Supported: png, jpg, jpeg, jfif, webp.",
    );
    return;
  }

  mainWindow.setProgressBar(-1);
  mainWindow.webContents.send(
    ELECTRON_COMMANDS.FOLDER_UPSCAYL_DONE,
    outputBase,
  );

  if (!encounteredError) {
    showNotification("Upscayled", "Images upscayled successfully!");
  } else {
    showNotification(
      "Upscayled",
      "Images were upscayled but encountered some errors!",
    );
  }
};

export default batchUpscayl;
