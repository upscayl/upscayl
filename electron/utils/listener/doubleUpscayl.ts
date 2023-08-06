import { ipcMain } from "electron";
import commands from "../../commands";
import { parse } from "path";
import { spawnUpscayl } from "../../upscayl";
import {
  getDoubleUpscaleArguments,
  getDoubleUpscaleSecondPassArguments,
} from "../getArguments";
import Jimp from "jimp";

export default function ({
  mainWindow,
  slash,
  logit,
  childProcesses,
  stopped,
  modelsPath,
  customModelsFolderPath,
  saveOutputFolder,
  outputFolderPath,
  quality,
  defaultModels,
}: {
  mainWindow: Electron.BrowserWindow;
  slash: string;
  logit: (message: string, ...optionalParams: any[]) => void;
  childProcesses: any[];
  stopped: boolean;
  modelsPath: string;
  customModelsFolderPath: string | undefined;
  saveOutputFolder: boolean;
  outputFolderPath: string | undefined;
  quality: number;
  defaultModels: string[];
}) {
  ipcMain.on(commands.DOUBLE_UPSCAYL, async (event, payload) => {
    const model = payload.model as string;
    let inputDir = (payload.imagePath.match(/(.*)[\/\\]/)[1] || "") as string;
    let outputDir = payload.outputPath as string;

    if (saveOutputFolder === true && outputFolderPath) {
      outputDir = outputFolderPath;
    }
    const gpuId = payload.gpuId as string;
    const saveImageAs = payload.saveImageAs as string;

    const isDefaultModel = defaultModels.includes(model);

    // COPY IMAGE TO TMP FOLDER

    const fullfileName = payload.imagePath.split(slash).slice(-1)[0] as string;
    const fileName = parse(fullfileName).name;
    const outFile =
      outputDir +
      slash +
      fileName +
      "_upscayl_16x_" +
      model +
      "." +
      saveImageAs;

    let scale = "4";
    if (model.includes("x2")) {
      scale = "2";
    } else if (model.includes("x3")) {
      scale = "3";
    } else {
      scale = "4";
    }

    // UPSCALE
    let upscayl = spawnUpscayl(
      "realesrgan",
      getDoubleUpscaleArguments(
        inputDir,
        fullfileName,
        outFile,
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
    let isAlpha = false;
    let failed2 = false;

    const onData = (data) => {
      // CONVERT DATA TO STRING
      data = data.toString();
      // SEND UPSCAYL PROGRESS TO RENDERER
      mainWindow.webContents.send(commands.DOUBLE_UPSCAYL_PROGRESS, data);
      // IF PROGRESS HAS ERROR, UPSCAYL FAILED
      if (data.includes("invalid gpu") || data.includes("failed")) {
        failed = true;
      }
      if (data.includes("has alpha channel")) {
        isAlpha = true;
      }
    };

    const onError = (data) => {
      data.toString();
      // SEND UPSCAYL PROGRESS TO RENDERER
      mainWindow.webContents.send(commands.DOUBLE_UPSCAYL_PROGRESS, data);
      // SET FAILED TO TRUE
      failed = true;
      return;
    };

    const onData2 = (data) => {
      // CONVERT DATA TO STRING
      data = data.toString();
      // SEND UPSCAYL PROGRESS TO RENDERER
      mainWindow.webContents.send(commands.DOUBLE_UPSCAYL_PROGRESS, data);
      // IF PROGRESS HAS ERROR, UPSCAYL FAILED
      if (data.includes("invalid gpu") || data.includes("failed")) {
        failed2 = true;
      }
    };

    const onError2 = (data) => {
      data.toString();
      // SEND UPSCAYL PROGRESS TO RENDERER
      mainWindow.webContents.send(commands.DOUBLE_UPSCAYL_PROGRESS, data);
      // SET FAILED TO TRUE
      failed2 = true;
      return;
    };

    const onClose2 = async (code) => {
      if (!failed2 && !stopped) {
        logit("💯 Done upscaling");
        logit("♻ Scaling and converting now...");
        const originalImage = await Jimp.read(inputDir + slash + fullfileName);
        try {
          const newImage = await Jimp.read(
            isAlpha ? outFile + ".png" : outFile
          );
          try {
            newImage
              .scaleToFit(
                originalImage.getWidth() * parseInt(payload.scale),
                originalImage.getHeight() * parseInt(payload.scale)
              )
              .quality(100 - quality)
              .write(isAlpha ? outFile + ".png" : outFile);
            mainWindow.setProgressBar(-1);
            mainWindow.webContents.send(
              commands.DOUBLE_UPSCAYL_DONE,
              isAlpha ? outFile + ".png" : outFile
            );
          } catch (error) {
            logit("❌ Error converting to PNG: ", error);
            onError(error);
          }
        } catch (error) {
          logit("❌ Error reading original image metadata", error);
          onError(error);
        }
      }
    };

    upscayl.process.stderr.on("data", onData);
    upscayl.process.on("error", onError);
    upscayl.process.on("close", (code) => {
      // IF NOT FAILED
      if (!failed && !stopped) {
        // UPSCALE
        let upscayl2 = spawnUpscayl(
          "realesrgan",
          getDoubleUpscaleSecondPassArguments(
            isAlpha,
            outFile,
            isDefaultModel ? modelsPath : customModelsFolderPath ?? modelsPath,
            model,
            gpuId,
            saveImageAs,
            scale
          ),
          logit
        );

        childProcesses.push(upscayl2);

        upscayl2.process.stderr.on("data", onData2);
        upscayl2.process.on("error", onError2);
        upscayl2.process.on("close", onClose2);
      }
    });
  });
}
