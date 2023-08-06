import { ipcMain } from "electron";
import commands from "../../commands";
import { spawnUpscayl } from "../../upscayl";
import { getBatchArguments } from "../getArguments";
import fs from "fs";

export type FolderUpscaylProps = {
  mainWindow: Electron.BrowserWindow;
  logit: (message: string, ...optionalParams: any[]) => void;
  childProcesses: any[];
  stopped: boolean;
  modelsPath: string;
  customModelsFolderPath: string | undefined;
  saveOutputFolder: boolean;
  outputFolderPath: string | undefined;
  defaultModels: string[];
};

export default function ({
  mainWindow,
  logit,
  childProcesses,
  stopped,
  modelsPath,
  customModelsFolderPath,
  saveOutputFolder,
  outputFolderPath,
  defaultModels,
}: FolderUpscaylProps) {
  ipcMain.on(commands.FOLDER_UPSCAYL, async (event, payload) => {
    // GET THE MODEL
    const model = payload.model;
    const gpuId = payload.gpuId;
    const saveImageAs = payload.saveImageAs;
    const scale = payload.scale as string;

    // GET THE IMAGE DIRECTORY
    let inputDir = payload.batchFolderPath;
    // GET THE OUTPUT DIRECTORY
    let outputDir = payload.outputPath;

    if (saveOutputFolder === true && outputFolderPath) {
      outputDir = outputFolderPath;
    }

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const isDefaultModel = defaultModels.includes(model);

    // UPSCALE
    const upscayl = spawnUpscayl(
      "realesrgan",
      getBatchArguments(
        inputDir,
        outputDir,
        isDefaultModel ? modelsPath : customModelsFolderPath ?? modelsPath,
        model,
        gpuId,
        saveImageAs,
        scale
      ),
      logit
    );

    childProcesses.push(upscayl);

    stopped = false;
    let failed = false;

    const onData = (data: any) => {
      data = data.toString();
      mainWindow.webContents.send(
        commands.FOLDER_UPSCAYL_PROGRESS,
        data.toString()
      );
      if (data.includes("invalid gpu") || data.includes("failed")) {
        logit("❌ INVALID GPU OR INVALID FILES IN FOLDER - FAILED");
        failed = true;
        upscayl.kill();
      }
    };
    const onError = (data: any) => {
      mainWindow.webContents.send(
        commands.FOLDER_UPSCAYL_PROGRESS,
        data.toString()
      );
      failed = true;
      upscayl.kill();
      return;
    };
    const onClose = () => {
      if (!failed && !stopped) {
        logit("💯 Done upscaling");
        mainWindow.webContents.send(commands.FOLDER_UPSCAYL_DONE, outputDir);
      } else {
        upscayl.kill();
      }
    };

    upscayl.process.stderr.on("data", onData);
    upscayl.process.on("error", onError);
    upscayl.process.on("close", onClose);
  });
}
