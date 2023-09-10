import fs from "fs";
import { modelsPath } from "../binaries";
import COMMAND from "../constants/commands";
import {
  customModelsFolderPath,
  folderPath,
  outputFolderPath,
  overwrite,
  saveOutputFolder,
  setChildProcesses,
  setOverwrite,
  setStopped,
  stopped,
} from "../utils/config-variables";
import convertAndScale from "../utils/convert-and-scale";
import { getSingleImageArguments } from "../utils/get-arguments";
import logit from "../utils/logit";
import slash from "../utils/slash";
import { spawnUpscayl } from "../utils/spawn-upscayl";
import { parse } from "path";
import DEFAULT_MODELS from "../constants/models";
import { getMainWindow } from "../main-window";

const imageUpscayl = async (event, payload) => {
  const mainWindow = getMainWindow();

  if (!mainWindow) {
    console.log("No main window");
    return;
  }

  setOverwrite(payload.overwrite);
  console.log({
    overwrite: payload.overwrite,
  });

  const model = payload.model as string;
  const gpuId = payload.gpuId as string;
  const saveImageAs = payload.saveImageAs as string;

  let inputDir = (payload.imagePath.match(/(.*)[\/\\]/)[1] || "") as string;
  let outputDir: string | undefined =
    folderPath || (payload.outputPath as string);

  if (saveOutputFolder === true && outputFolderPath) {
    outputDir = outputFolderPath;
  }

  const isDefaultModel = DEFAULT_MODELS.includes(model);

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
  if (fs.existsSync(outFile) && !overwrite) {
    // If already upscayled, just output that file
    logit("✅ Already upscayled at: ", outFile);
    mainWindow.webContents.send(
      COMMAND.UPSCAYL_DONE,
      outFile.replace(
        /([^/\\]+)$/i,
        encodeURIComponent(outFile.match(/[^/\\]+$/i)![0])
      )
    );
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
        "png"
      ),
      logit
    );

    setChildProcesses(upscayl);

    setStopped(false);
    let isAlpha = false;
    let failed = false;

    const onData = (data: string) => {
      logit("image upscayl: ", data.toString());
      mainWindow.setProgressBar(parseFloat(data.slice(0, data.length)) / 100);
      data = data.toString();
      mainWindow.webContents.send(COMMAND.UPSCAYL_PROGRESS, data.toString());
      if (data.includes("invalid gpu") || data.includes("failed")) {
        logit("❌ INVALID GPU OR FAILED");
        upscayl.kill();
        failed = true;
      }
      if (data.includes("has alpha channel")) {
        logit("📢 INCLUDES ALPHA CHANNEL, CHANGING OUTFILE NAME!");
        isAlpha = true;
      }
    };
    const onError = (data) => {
      if (!mainWindow) return;
      mainWindow.setProgressBar(-1);
      mainWindow.webContents.send(COMMAND.UPSCAYL_PROGRESS, data.toString());
      failed = true;
      upscayl.kill();
      return;
    };
    const onClose = async () => {
      if (!failed && !stopped) {
        logit("💯 Done upscaling");
        logit("♻ Scaling and converting now...");
        mainWindow.webContents.send(COMMAND.SCALING_AND_CONVERTING);
        // Free up memory
        upscayl.kill();
        try {
          await convertAndScale(
            inputDir + slash + fullfileName,
            isAlpha ? outFile + ".png" : outFile,
            outFile,
            payload.scale,
            saveImageAs,
            onError
          );
          mainWindow.setProgressBar(-1);
          mainWindow.webContents.send(
            COMMAND.UPSCAYL_DONE,
            outFile.replace(
              /([^/\\]+)$/i,
              encodeURIComponent(outFile.match(/[^/\\]+$/i)![0])
            )
          );
        } catch (error) {
          logit(
            "❌ Error processing (scaling and converting) the image. Please report this error on GitHub.",
            error
          );
          upscayl.kill();
          mainWindow.webContents.send(
            COMMAND.UPSCAYL_ERROR,
            "Error processing (scaling and converting) the image. Please report this error on Upscayl GitHub Issues page."
          );
        }
      }
    };

    upscayl.process.stderr.on("data", onData);
    upscayl.process.on("error", onError);
    upscayl.process.on("close", onClose);
  }
};

export default imageUpscayl;
