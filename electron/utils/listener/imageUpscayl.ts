import { ipcMain } from "electron";
import commands from "../../commands";
import { parse } from "path";
import { spawnUpscayl } from "../../upscayl";
import Jimp from "jimp";
import { getSingleImageArguments } from "../getArguments";
import fs from "fs";

export type ImageUpscaylProps = {
  mainWindow: Electron.BrowserWindow;
  slash: string;
  logit: (...args: any) => void;
  childProcesses: any[];
  stopped: boolean;
  modelsPath: string;
  customModelsFolderPath: string | undefined;
  saveOutputFolder: boolean;
  outputFolderPath: string | undefined;
  quality: number;
  defaultModels: string[];
  folderPath: string | undefined;
};

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
  folderPath,
}: ImageUpscaylProps) {
  ipcMain.on(commands.UPSCAYL, async (event, payload) => {
    const model = payload.model as string;
    const gpuId = payload.gpuId as string;
    const saveImageAs = payload.saveImageAs as string;

    let inputDir = (payload.imagePath.match(/(.*)[\/\\]/)[1] || "") as string;
    let outputDir = folderPath || (payload.outputPath as string);

    if (saveOutputFolder === true && outputFolderPath) {
      outputDir = outputFolderPath;
    }

    const isDefaultModel = defaultModels.includes(model);

    const fullfileName = payload.imagePath.replace(/^.*[\\\/]/, "") as string;
    const fileName = parse(fullfileName).name;
    const fileExt = parse(fullfileName).ext;

    let scale = "4";
    if (model.includes("x2")) {
      scale = "2";
    } else if (model.includes("x3")) {
      scale = "3";
    } else {
      scale = "4";
    }

    const outFile =
      outputDir +
      slash +
      fileName +
      "_upscayl_" +
      payload.scale +
      "x_" +
      model +
      "." +
      saveImageAs;

    // UPSCALE
    if (fs.existsSync(outFile)) {
      // If already upscayled, just output that file
      logit("✅ Already upscayled at: ", outFile);
      mainWindow.webContents.send(commands.UPSCAYL_DONE, outFile);
    } else {
      const upscayl = spawnUpscayl(
        "realesrgan",
        getSingleImageArguments(
          inputDir,
          fullfileName,
          outFile,
          isDefaultModel ? modelsPath : customModelsFolderPath ?? modelsPath,
          model,
          scale,
          gpuId,
          saveImageAs
        ),
        logit
      );

      childProcesses.push(upscayl);

      stopped = false;
      let isAlpha = false;
      let failed = false;

      const onData = (data: string) => {
        logit("image upscayl: ", data.toString());
        mainWindow.setProgressBar(parseFloat(data.slice(0, data.length)) / 100);
        data = data.toString();
        mainWindow.webContents.send(commands.UPSCAYL_PROGRESS, data.toString());
        if (data.includes("invalid gpu") || data.includes("failed")) {
          logit("❌ INVALID GPU OR FAILED");
          failed = true;
        }
        if (data.includes("has alpha channel")) {
          logit("📢 INCLUDES ALPHA CHANNEL, CHANGING OUTFILE NAME!");
          isAlpha = true;
        }
      };
      const onError = (data) => {
        mainWindow.webContents.send(commands.UPSCAYL_PROGRESS, data.toString());
        failed = true;
        return;
      };
      const onClose = async () => {
        if (!failed && !stopped) {
          logit("💯 Done upscaling");
          logit("♻ Scaling and converting now...");
          const originalImage = await Jimp.read(
            inputDir + slash + fullfileName
          );
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
                commands.UPSCAYL_DONE,
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
      upscayl.process.on("close", onClose);
    }
  });
}
