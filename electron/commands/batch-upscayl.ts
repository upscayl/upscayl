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
import { copyMetadata } from "../utils/copy-metadata";

const getSubDirs = (targetDirPath: string): string[] => {
  const subDirs = fs.readdirSync(targetDirPath, { withFileTypes: true });
  let results: string[] = [];

  for (const subDir of subDirs) {
    if (subDir.isDirectory()) {
      const subDirPath = targetDirPath + slash + subDir.name;
      results.push(subDirPath); 
      results.push(...getSubDirs(subDirPath)); 
    }
  }
  return results;
};

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
  const recursiveBatch = payload.recursiveBatch;
  // GET THE IMAGE DIRECTORY
  let inputDir = decodeURIComponent(payload.batchFolderPath);
  // GET THE OUTPUT DIRECTORY
  let outputFolderPath = decodeURIComponent(payload.outputPath);
  const outputFolderName = `upscayl_${saveImageAs}_${model}_${
    useCustomWidth ? `${customWidth}px` : `${scale}x`
  }`;
  outputFolderPath += slash + outputFolderName;

  const isDefaultModel = model in MODELS;
  let inputDirs = [inputDir]
  if (recursiveBatch) {
    inputDirs.push(...getSubDirs(inputDir));
  } 

  setStopped(false);
  let encounteredError = false;

  for (const currentInputDir of inputDirs) {
    if (stopped) break;
    await new Promise<void>((resolve) => {
      const currentRelativePath = currentInputDir.replace(inputDir, "");
      const currentOutputDir = outputFolderPath + currentRelativePath;

      // CREATE THE OUTPUT DIRECTORY
      if (!fs.existsSync(currentOutputDir)) {
        fs.mkdirSync(currentOutputDir, { recursive: true });
      }

      // UPSCALE
      const upscayl = spawnUpscayl(
        getBatchArguments({
          inputDir: currentInputDir,
          outputDir: currentOutputDir,
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

      let failed = false;
      childProcesses.push(upscayl);

      const onData = (data: any) => {
        if (!mainWindow) resolve();
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
        if (!mainWindow) resolve();
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
        resolve();
      };
      const onClose = async () => {
        if (!mainWindow) resolve();
        if (!failed && !stopped) {
          logit("💯 Done upscaling");
          upscayl.kill();
          if (payload.copyMetadata) {
            logit("🏷️ Copying metadata...");
            try {
              const files = fs.readdirSync(currentOutputDir);
              for (const file of files) {
                const outFile = currentOutputDir + slash + file;
                const originalFile = currentInputDir + slash + file;
                if (fs.existsSync(outFile) && fs.existsSync(originalFile)) {
                    try {
                      await copyMetadata(originalFile, outFile);
                      logit("✅ Metadata copied to: ", outFile);
                    } catch (error) {
                      logit("❌ Error copying metadata: ", error);
                      mainWindow.webContents.send(
                        ELECTRON_COMMANDS.METADATA_ERROR,
                        error,
                      );
                    } 
                }
              }
            } catch (err) {
              logit("❌ Error in batch metadata copy: ", err);
            }
          }
        } else {
          upscayl.kill();
        }
        resolve();
      };
      upscayl.process.stderr.on("data", onData);
      upscayl.process.on("error", onError);
      upscayl.process.on("close", onClose);
    });
  }

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
}

export default batchUpscayl;
