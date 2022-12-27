// Native
import { join, parse } from "path";
import { format } from "url";
import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import fs from "fs";
import sizeOf from "image-size";
import { autoUpdater } from "electron-updater";
import getPlatform from "./getPlatform";
import ffmpeg from "upscayl-ffmpeg";

import { execPath, modelsPath } from "./binaries";

// Packages
import {
  BrowserWindow,
  app,
  ipcMain,
  dialog,
  shell,
  MessageBoxOptions,
} from "electron";

import isDev from "electron-is-dev";
import prepareNext from "electron-next";
import commands from "./commands";

// Prepare the renderer once the app is ready
let mainWindow;
app.on("ready", async () => {
  await prepareNext("./renderer");

  console.log("🚀 ICON PATH: ", join(__dirname, "build", "icon.png"));
  console.log("🚀 UPSCAYL EXEC PATH: ", execPath(""));
  console.log("🚀 MODELS PATH: ", modelsPath);
  console.log("🚀 FFMPEG PATH: ", ffmpeg.path);

  mainWindow = new BrowserWindow({
    icon: join(__dirname, "build", "icon.png"),
    width: 1300,
    height: 940,
    minHeight: 500,
    minWidth: 500,
    show: false,
    backgroundColor: "#171717",
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
      preload: join(__dirname, "preload.js"),
    },
  });
  const url = isDev
    ? "http://localhost:8000"
    : format({
        pathname: join(__dirname, "../renderer/out/index.html"),
        protocol: "file:",
        slashes: true,
      });

  mainWindow.setMenuBarVisibility(false);
  mainWindow.loadURL(url);

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
    mainWindow.webContents.setZoomFactor(1);
  });

  if (!isDev) {
    autoUpdater.checkForUpdates();
  }
});

// Quit the app once all windows are closed
app.on("window-all-closed", app.quit);

console.log(app.getAppPath());
//------------------------Select File-----------------------------//
// ! DONT FORGET TO RESTART THE APP WHEN YOU CHANGE CODE HERE
ipcMain.handle(commands.SELECT_FILE, async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ["openFile", "multiSelections"],
  });

  if (canceled) {
    console.log("operation cancelled");
    return "cancelled";
  } else {
    console.log(filePaths[0]);
    // CREATE input AND upscaled FOLDER
    return filePaths[0];
  }
});

//------------------------Select Folder-----------------------------//
ipcMain.handle(commands.SELECT_FOLDER, async (event, message) => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });
  if (canceled) {
    console.log("operation cancelled");
    return "cancelled";
  } else {
    console.log(filePaths[0]);
    return filePaths[0];
  }
});

//------------------------Open Folder-----------------------------//
ipcMain.on(commands.OPEN_FOLDER, async (event, payload) => {
  console.log(payload);
  shell.openPath(payload);
});

//------------------------Double Upscayl-----------------------------//
ipcMain.on(commands.DOUBLE_UPSCAYL, async (event, payload) => {
  const model = payload.model;
  let inputDir = payload.imagePath.match(/(.*)[\/\\]/)[1] || "";
  let outputDir = payload.outputPath;
  const gpuId = payload.gpuId;
  const saveImageAs = payload.saveImageAs;

  // COPY IMAGE TO TMP FOLDER
  const platform = getPlatform();
  const fullfileName =
    platform === "win"
      ? payload.imagePath.split("\\").slice(-1)[0]
      : payload.imagePath.split("/").slice(-1)[0];
  const fileName = parse(fullfileName).name;
  const fileExt = parse(fullfileName).ext;
  const outFile =
    outputDir + "/" + fileName + "_upscayl_8x_" + model + "." + saveImageAs;

  // UPSCALE
  let upscayl = spawn(
    execPath("realesrgan"),
    [
      "-i",
      inputDir + "/" + fullfileName,
      "-o",
      outFile,
      "-s",
      4,
      "-m",
      modelsPath,
      "-n",
      model,
      gpuId ? `-g ${gpuId}` : "",
      "-f",
      saveImageAs,
    ],
    {
      cwd: undefined,
      detached: false,
    }
  );

  console.log(
    "🆙 COMMAND:",
    "-i",
    inputDir + "/" + fullfileName,
    "-o",
    outFile,
    "-s",
    4,
    "-m",
    modelsPath,
    "-n",
    model,
    gpuId ? `-g ${gpuId}` : "",
    "-f",
    saveImageAs
  );

  let failed = false;
  let isAlpha = false;

  // TAKE UPSCAYL OUTPUT
  upscayl.stderr.on("data", (data) => {
    // CONVERT DATA TO STRING
    data = data.toString();
    // PRINT TO CONSOLE
    console.log(data);
    // SEND UPSCAYL PROGRESS TO RENDERER
    mainWindow.webContents.send(commands.DOUBLE_UPSCAYL_PROGRESS, data);
    // IF PROGRESS HAS ERROR, UPSCAYL FAILED
    if (data.includes("invalid gpu") || data.includes("failed")) {
      failed = true;
    }
    if (data.includes("has alpha channel")) {
      isAlpha = true;
    }
  });

  // IF ERROR
  upscayl.on("error", (data) => {
    data.toString();
    // SEND UPSCAYL PROGRESS TO RENDERER
    mainWindow.webContents.send(commands.DOUBLE_UPSCAYL_PROGRESS, data);
    // SET FAILED TO TRUE
    failed = true;
    return;
  });

  // ON UPSCAYL DONE
  upscayl.on("close", (code) => {
    // IF NOT FAILED
    if (!failed) {
      // UPSCALE
      let upscayl2 = spawn(
        execPath("realesrgan"),
        [
          "-i",
          isAlpha ? outFile + ".png" : outFile,
          "-o",
          isAlpha ? outFile + ".png" : outFile,
          "-s",
          4,
          "-m",
          modelsPath,
          "-n",
          model,
          gpuId ? `-g ${gpuId}` : "",
          "-f",
          isAlpha ? "" : saveImageAs,
        ],
        {
          cwd: undefined,
          detached: false,
        }
      );

      let failed2 = false;
      // TAKE UPSCAYL OUTPUT
      upscayl2.stderr.on("data", (data) => {
        // CONVERT DATA TO STRING
        data = data.toString();
        // PRINT TO CONSOLE
        console.log(data);
        // SEND UPSCAYL PROGRESS TO RENDERER
        mainWindow.webContents.send(commands.DOUBLE_UPSCAYL_PROGRESS, data);
        // IF PROGRESS HAS ERROR, UPSCAYL FAILED
        if (data.includes("invalid gpu") || data.includes("failed")) {
          failed2 = true;
        }
      });

      // IF ERROR
      upscayl2.on("error", (data) => {
        data.toString();
        // SEND UPSCAYL PROGRESS TO RENDERER
        mainWindow.webContents.send(commands.DOUBLE_UPSCAYL_PROGRESS, data);
        // SET FAILED TO TRUE
        failed2 = true;
        return;
      });

      upscayl2.on("close", (code) => {
        if (!failed2) {
          console.log("Done upscaling");
          mainWindow.webContents.send(
            commands.DOUBLE_UPSCAYL_DONE,
            isAlpha ? outFile + ".png" : outFile
          );
        }
      });
    }
  });
});

//------------------------Image Upscayl-----------------------------//
ipcMain.on(commands.UPSCAYL, async (event, payload) => {
  const model = payload.model;
  const scale = payload.scaleFactor;
  const gpuId = payload.gpuId;
  const saveImageAs = payload.saveImageAs;
  let inputDir = payload.imagePath.match(/(.*)[\/\\]/)[1] || "";
  let outputDir = payload.outputPath;

  // COPY IMAGE TO TMP FOLDER
  const fullfileName = payload.imagePath.replace(/^.*[\\\/]/, "");

  const fileName = parse(fullfileName).name;
  console.log("🚀 => fileName", fileName);

  const fileExt = parse(fullfileName).ext;
  console.log("🚀 => fileExt", fileExt);

  const outFile = model.includes("models-DF2K")
    ? outputDir +
      "/" +
      fileName +
      "_sharpened_" +
      scale +
      "x_" +
      model +
      "." +
      saveImageAs
    : outputDir +
      "/" +
      fileName +
      "_upscayl_" +
      scale +
      "x_" +
      model +
      "." +
      saveImageAs;

  // UPSCALE
  if (fs.existsSync(outFile)) {
    // If already upscayled, just output that file
    mainWindow.webContents.send(commands.UPSCAYL_DONE, outFile);
  } else {
    let upscayl: ChildProcessWithoutNullStreams | null = null;
    switch (model) {
      default:
        upscayl = spawn(
          execPath("realesrgan"),
          [
            "-i",
            inputDir + "/" + fullfileName,
            "-o",
            outFile,
            "-s",
            scale === 2 ? 4 : scale,
            "-m",
            modelsPath,
            "-n",
            model,
            gpuId ? `-g ${gpuId}` : "",
            "-f",
            saveImageAs,
          ],
          {
            cwd: undefined,
            detached: false,
          }
        );
        console.log(
          "🆙 COMMAND: ",
          "-i",
          inputDir + "/" + fullfileName,
          "-o",
          outFile,
          "-s",
          scale === 2 ? 4 : scale,
          "-m",
          modelsPath,
          "-n",
          model,
          gpuId ? `-g ${gpuId}` : "",
          "-f",
          saveImageAs
        );
        break;
      case "models-DF2K":
        upscayl = spawn(
          execPath("realsr"),
          [
            "-i",
            inputDir + "/" + fullfileName,
            "-o",
            outFile,
            "-s",
            scale,
            "-x",
            "-m",
            modelsPath + "/" + model,
            gpuId ? `-g ${gpuId}` : "",
            "-f",
            saveImageAs,
          ],
          {
            cwd: undefined,
            detached: false,
          }
        );
        console.log(
          "🆙 COMMAND: ",
          "-i",
          inputDir + "/" + fullfileName,
          "-o",
          outFile,
          "-s",
          scale,
          "-x",
          "-m",
          modelsPath + "/" + model,
          gpuId ? `-g ${gpuId}` : "",
          "-f",
          saveImageAs
        );
        break;
    }

    let isAlpha = false;
    let failed = false;

    upscayl?.stderr.on("data", (data: string) => {
      console.log(
        "🚀 => upscayl.stderr.on => stderr.toString()",
        data.toString()
      );
      data = data.toString();
      mainWindow.webContents.send(commands.UPSCAYL_PROGRESS, data.toString());
      if (data.includes("invalid gpu") || data.includes("failed")) {
        failed = true;
      }
      if (data.includes("has alpha channel")) {
        console.log("INCLUDES ALPHA CHANNEL, CHANGING OUTFILE NAME!");
        isAlpha = true;
      }
    });

    upscayl?.on("error", (data) => {
      mainWindow.webContents.send(commands.UPSCAYL_PROGRESS, data.toString());
      failed = true;
      return;
    });

    // Send done comamnd when
    upscayl?.on("close", (code) => {
      if (failed !== true) {
        console.log("Done upscaling");
        mainWindow.webContents.send(
          commands.UPSCAYL_DONE,
          isAlpha ? outFile + ".png" : outFile
        );
      }
    });
  }
});

//------------------------Upscayl Folder-----------------------------//
ipcMain.on(commands.FOLDER_UPSCAYL, async (event, payload) => {
  // GET THE MODEL
  const model = payload.model;
  const gpuId = payload.gpuId;
  const saveImageAs = payload.saveImageAs;

  // GET THE IMAGE DIRECTORY
  let inputDir = payload.batchFolderPath;
  console.log("🚀 => file: index.ts => line 471 => inputDir", inputDir);

  // GET THE OUTPUT DIRECTORY
  let outputDir = model.includes("models-DF2K")
    ? payload.outputPath + "_sharpened"
    : payload.outputPath;
  console.log("🚀 => file: index.ts => line 474 => outputDir", outputDir);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  // UPSCALE
  let upscayl: ChildProcessWithoutNullStreams | null = null;
  switch (model) {
    default:
      upscayl = spawn(
        execPath("realesrgan"),
        [
          "-i",
          inputDir,
          "-o",
          outputDir,
          "-s",
          4,
          "-m",
          modelsPath,
          "-n",
          model,
          gpuId ? `-g ${gpuId}` : "",
          "-f",
          saveImageAs,
        ],
        {
          cwd: undefined,
          detached: false,
        }
      );
      console.log(
        "🆙 COMMAND:",
        "-i",
        inputDir,
        "-o",
        outputDir,
        "-s",
        4,
        "-m",
        modelsPath,
        "-n",
        model,
        gpuId ? `-g ${gpuId}` : "",
        "-f",
        saveImageAs
      );
      break;
    case "models-DF2K":
      upscayl = spawn(
        execPath("realsr"),
        [
          "-i",
          inputDir,
          "-o",
          outputDir,
          "-s",
          4,
          "-x",
          "-m",
          modelsPath + "/" + model,
          gpuId ? `-g ${gpuId}` : "",
          "-f",
          saveImageAs,
        ],
        {
          cwd: undefined,
          detached: false,
        }
      );
      console.log(
        "🆙 COMMAND:",
        "-i",
        inputDir,
        "-o",
        outputDir,
        "-s",
        4,
        "-x",
        "-m",
        modelsPath + "/" + model,
        gpuId ? `-g ${gpuId}` : "",
        "-f",
        saveImageAs
      );
      break;
  }

  let failed = false;
  upscayl?.stderr.on("data", (data) => {
    console.log(
      "🚀 => upscayl.stderr.on => stderr.toString()",
      data.toString()
    );
    data = data.toString();
    mainWindow.webContents.send(
      commands.FOLDER_UPSCAYL_PROGRESS,
      data.toString()
    );
    if (data.includes("invalid gpu") || data.includes("failed")) {
      failed = true;
    }
  });

  upscayl?.on("error", (data) => {
    mainWindow.webContents.send(
      commands.FOLDER_UPSCAYL_PROGRESS,
      data.toString()
    );
    failed = true;
    return;
  });

  // Send done comamnd when
  upscayl?.on("close", (code) => {
    if (failed !== true) {
      console.log("Done upscaling");
      mainWindow.webContents.send(commands.FOLDER_UPSCAYL_DONE, outputDir);
    }
  });
});

//------------------------Video Upscayl-----------------------------//
ipcMain.on(commands.UPSCAYL_VIDEO, async (event, payload) => {
  // Extract the model
  const model = payload.model;

  // Extract the Video Directory
  let videoFileName = payload.videoPath.replace(/^.*[\\\/]/, "");
  const justFileName = parse(videoFileName).name;

  let inputDir = payload.videoPath.match(/(.*)[\/\\]/)[1] || "";
  console.log("🚀 => file: index.ts => line 337 => inputDir", inputDir);

  // Set the output directory
  let outputDir = payload.outputPath + "_frames";
  console.log("🚀 => file: index.ts => line 340 => outputDir", outputDir);

  let frameExtractionPath = join(inputDir, justFileName + "_f");
  let frameUpscalePath = join(inputDir, justFileName + "_u");
  console.log(
    "🚀 => file: index.ts => line 342 => frameExtractionPath",
    frameExtractionPath,
    frameUpscalePath
  );

  if (!fs.existsSync(frameExtractionPath)) {
    fs.mkdirSync(frameExtractionPath, { recursive: true });
  }
  if (!fs.existsSync(frameUpscalePath)) {
    fs.mkdirSync(frameUpscalePath, { recursive: true });
  }

  let ffmpegProcess: ChildProcessWithoutNullStreams | null = null;
  ffmpegProcess = spawn(
    ffmpeg.path,
    [
      "-i",
      inputDir + "/" + videoFileName,
      frameExtractionPath + "/" + "out%d.png",
    ],
    {
      cwd: undefined,
      detached: false,
    }
  );

  let failed = false;
  ffmpegProcess?.stderr.on("data", (data: string) => {
    console.log("🚀 => file: index.ts:420 => data", data.toString());
    data = data.toString();
    mainWindow.webContents.send(
      commands.FFMPEG_VIDEO_PROGRESS,
      data.toString()
    );
  });

  ffmpegProcess?.on("error", (data: string) => {
    mainWindow.webContents.send(
      commands.FFMPEG_VIDEO_PROGRESS,
      data.toString()
    );
    failed = true;
    return;
  });

  // Send done comamnd when
  ffmpegProcess?.on("close", (code: number) => {
    if (failed !== true) {
      console.log("Frame extraction successful!");
      mainWindow.webContents.send(commands.FFMPEG_VIDEO_DONE, outputDir);

      // UPSCALE
      let upscayl: ChildProcessWithoutNullStreams | null = null;
      upscayl = spawn(
        execPath("realesrgan"),
        [
          "-i",
          frameExtractionPath,
          "-o",
          frameUpscalePath,
          "-s",
          4,
          "-m",
          modelsPath,
          "-n",
          model,
        ],
        {
          cwd: undefined,
          detached: false,
        }
      );

      upscayl?.stderr.on("data", (data) => {
        console.log(
          "🚀 => upscayl.stderr.on => stderr.toString()",
          data.toString()
        );
        data = data.toString();
        mainWindow.webContents.send(
          commands.FFMPEG_VIDEO_PROGRESS,
          data.toString()
        );
      });
    }
  });
});

//------------------------Auto-Update Code-----------------------------//
// ! AUTO UPDATE STUFF
autoUpdater.on("update-available", ({ releaseNotes, releaseName }) => {
  const dialogOpts = {
    type: "info",
    buttons: ["Ok"],
    title: "Application Update",
    message:
      process.platform === "win32"
        ? (releaseNotes as string)
        : (releaseName as string),
    detail: "A new version is being downloaded.",
  };
  dialog.showMessageBox(dialogOpts).then((returnValue) => {});
});

autoUpdater.on("update-downloaded", (event) => {
  const dialogOpts: MessageBoxOptions = {
    type: "info",
    buttons: ["Restart", "Later"],
    title: "Application Update",
    message:
      process.platform === "win32"
        ? (event.releaseNotes as string)
        : (event.releaseName as string),
    detail:
      "A new version has been downloaded. Restart the application to apply the updates.",
  };
  dialog.showMessageBox(dialogOpts).then((returnValue) => {
    if (returnValue.response === 0) autoUpdater.quitAndInstall();
  });
});
