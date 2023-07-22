import {
  getBatchArguments,
  getDoubleUpscaleArguments,
  getDoubleUpscaleSecondPassArguments,
  getSingleImageArguments,
} from "./utils/getArguments";
// Native
import { autoUpdater } from "electron-updater";
import getPlatform from "./getPlatform";
// import ffmpeg from "upscayl-ffmpeg";
import { join, parse } from "path";
import log from "electron-log";
import { format } from "url";
import fs from "fs";
import Jimp from "jimp";

import { execPath, modelsPath } from "./binaries";
// Packages
import {
  BrowserWindow,
  app,
  ipcMain,
  dialog,
  shell,
  MessageBoxOptions,
  protocol,
} from "electron";

import { spawnUpscayl } from "./upscayl";
import prepareNext from "electron-next";
import isDev from "electron-is-dev";
import commands from "./commands";
import { ChildProcessWithoutNullStreams } from "child_process";

let childProcesses: {
  process: ChildProcessWithoutNullStreams;
  kill: () => boolean;
}[] = [];

log.initialize({ preload: true });

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

// Path variables for file and folder selection
let imagePath: string | undefined = undefined;
let folderPath: string | undefined = undefined;
let customModelsFolderPath: string | undefined = undefined;
let outputFolderPath: string | undefined = undefined;
let saveOutputFolder = false;

let stopped = false;

// Slashes for use in directory names
const slash: string = getPlatform() === "win" ? "\\" : "/";

// Prepare the renderer once the app is ready
let mainWindow: BrowserWindow;
app.on("ready", async () => {
  await prepareNext("./renderer");

  log.info("🚀 UPSCAYL EXEC PATH: ", execPath(""));
  log.info("🚀 MODELS PATH: ", modelsPath);

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
      nodeIntegrationInWorker: true,
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

  app.whenReady().then(() => {
    protocol.registerFileProtocol("file", (request, callback) => {
      const pathname = decodeURI(request.url.replace("file:///", ""));
      callback(pathname);
    });
  });

  if (!isDev) {
    autoUpdater.checkForUpdates();
  }

  // GET LAST IMAGE PATH TO LOCAL STORAGE
  mainWindow.webContents
    .executeJavaScript('localStorage.getItem("lastImagePath");', true)
    .then((lastImagePath: string | null) => {
      if (lastImagePath && lastImagePath.length > 0) {
        imagePath = lastImagePath;
      }
    });

  // GET LAST FOLDER PATH TO LOCAL STORAGE
  mainWindow.webContents
    .executeJavaScript('localStorage.getItem("lastFolderPath");', true)
    .then((lastFolderPath: string | null) => {
      if (lastFolderPath && lastFolderPath.length > 0) {
        folderPath = lastFolderPath;
      }
    });

  // GET LAST CUSTOM MODELS FOLDER PATH TO LOCAL STORAGE
  mainWindow.webContents
    .executeJavaScript(
      'localStorage.getItem("lastCustomModelsFolderPath");',
      true
    )
    .then((lastCustomModelsFolderPath: string | null) => {
      if (lastCustomModelsFolderPath && lastCustomModelsFolderPath.length > 0) {
        customModelsFolderPath = lastCustomModelsFolderPath;
      }
    });

  // GET LAST CUSTOM MODELS FOLDER PATH TO LOCAL STORAGE
  mainWindow.webContents
    .executeJavaScript('localStorage.getItem("lastOutputFolderPath");', true)
    .then((lastOutputFolderPath: string | null) => {
      if (lastOutputFolderPath && lastOutputFolderPath.length > 0) {
        outputFolderPath = lastOutputFolderPath;
      }
    });

  // GET LAST SAVE OUTPUT FOLDER (BOOLEAN) TO LOCAL STORAGE
  mainWindow.webContents
    .executeJavaScript('localStorage.getItem("rememberOutputFolder");', true)
    .then((lastSaveOutputFolder: boolean | null) => {
      if (lastSaveOutputFolder !== null) {
        saveOutputFolder = lastSaveOutputFolder;
      }
    });
});

// Quit the app once all windows are closed
app.on("window-all-closed", app.quit);

log.log("🚃 App Path: ", app.getAppPath());

const logit = (...args: any) => {
  log.log(...args);
  mainWindow.webContents.send(commands.LOG, args.join(" "));
};

// Default models
const defaultModels = [
  "realesrgan-x4plus",
  "remacri",
  "ultramix_balanced",
  "ultrasharp",
  "realesrgan-x4plus-anime",
];

//------------------------Select File-----------------------------//
// ! DONT FORGET TO RESTART THE APP WHEN YOU CHANGE CODE HERE
ipcMain.handle(commands.SELECT_FILE, async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ["openFile", "multiSelections"],
    title: "Select Image",
    defaultPath: imagePath,
  });

  if (canceled) {
    logit("🚫 File Operation Cancelled");
    return null;
  } else {
    imagePath = filePaths[0];

    let isValid = false;
    // READ SELECTED FILES
    filePaths.forEach((file) => {
      // log.log("Files in Folder: ", file);
      if (
        file.endsWith(".png") ||
        file.endsWith(".jpg") ||
        file.endsWith(".jpeg") ||
        file.endsWith(".webp") ||
        file.endsWith(".JPG") ||
        file.endsWith(".PNG") ||
        file.endsWith(".JPEG") ||
        file.endsWith(".WEBP")
      ) {
        isValid = true;
      }
    });

    if (!isValid) {
      logit("❌ Invalid File Detected");
      const options: MessageBoxOptions = {
        type: "error",
        title: "Invalid File",
        message:
          "The selected file is not a valid image. Make sure you select a '.png', '.jpg', or '.webp' file.",
      };
      dialog.showMessageBoxSync(mainWindow, options);
      return null;
    }

    logit("📄 Selected File Path: ", filePaths[0]);
    // CREATE input AND upscaled FOLDER
    return filePaths[0];
  }
});

//------------------------Select Folder-----------------------------//
ipcMain.handle(commands.SELECT_FOLDER, async (event, message) => {
  const { canceled, filePaths: folderPaths } = await dialog.showOpenDialog({
    properties: ["openDirectory"],
    defaultPath: folderPath,
  });

  if (canceled) {
    logit("🚫 Select Folder Operation Cancelled");
    return null;
  } else {
    folderPath = folderPaths[0];
    logit("📁 Selected Folder Path: ", folderPath);
    return folderPaths[0];
  }
});

//------------------------Get Model Names-----------------------------//
const getModels = (folderPath: string) => {
  let models: string[] = [];
  let isValid = false;

  // READ CUSTOM MODELS FOLDER
  fs.readdirSync(folderPath).forEach((file) => {
    // log.log("Files in Folder: ", file);
    if (
      file.endsWith(".param") ||
      file.endsWith(".PARAM") ||
      file.endsWith(".bin") ||
      file.endsWith(".BIN")
    ) {
      isValid = true;
      const modelName = file.substring(0, file.lastIndexOf(".")) || file;
      if (!models.includes(modelName)) {
        models.push(modelName);
      }
    }
  });

  if (!isValid) {
    logit("❌ Invalid Custom Model Folder Detected");
    const options: MessageBoxOptions = {
      type: "error",
      title: "Invalid Folder",
      message:
        "The selected folder does not contain valid model files. Make sure you select the folder that ONLY contains '.param' and '.bin' files.",
      buttons: ["OK"],
    };
    dialog.showMessageBoxSync(options);
    return null;
  }

  logit("🔎 Detected Custom Models: ", models);
  return models;
};

ipcMain.on(commands.GET_MODELS_LIST, async (event, payload) => {
  if (payload) {
    customModelsFolderPath = payload;

    logit("📁 Custom Models Folder Path: ", customModelsFolderPath);

    mainWindow.webContents.send(
      commands.CUSTOM_MODEL_FILES_LIST,
      getModels(payload)
    );
  }
});

//------------------------Select Custom Models Folder---------------------//
ipcMain.handle(commands.SELECT_CUSTOM_MODEL_FOLDER, async (event, message) => {
  const { canceled, filePaths: folderPaths } = await dialog.showOpenDialog({
    properties: ["openDirectory"],
    title: "Select Custom Models Folder",
    defaultPath: customModelsFolderPath,
  });
  if (canceled) {
    logit("🚫 Select Custom Models Folder Operation Cancelled");
    return null;
  } else {
    customModelsFolderPath = folderPaths[0];

    if (
      !folderPaths[0].endsWith(slash + "models") &&
      !folderPaths[0].endsWith(slash + "models" + slash)
    ) {
      logit("❌ Invalid Custom Models Folder Detected: Not a 'models' folder");
      const options: MessageBoxOptions = {
        type: "error",
        title: "Invalid Folder",
        message:
          "Please make sure that the folder name is 'models' and nothing else.",
        buttons: ["OK"],
      };
      dialog.showMessageBoxSync(options);
      return null;
    }

    mainWindow.webContents.send(
      commands.CUSTOM_MODEL_FILES_LIST,
      getModels(customModelsFolderPath)
    );

    logit("📁 Custom Folder Path: ", customModelsFolderPath);
    return customModelsFolderPath;
  }
});

//------------------------Open Folder-----------------------------//
ipcMain.on(commands.OPEN_FOLDER, async (event, payload) => {
  logit("📂 Opening Folder: ", payload);
  shell.openPath(payload);
});

//------------------------Stop Command-----------------------------//
ipcMain.on(commands.STOP, async (event, payload) => {
  stopped = true;

  childProcesses.forEach((child) => {
    logit("🛑 Stopping Upscaling Process", child.process.pid);
    child.kill();
  });
});

//------------------------Double Upscayl-----------------------------//
ipcMain.on(commands.DOUBLE_UPSCAYL, async (event, payload) => {
  const model = payload.model as string;
  let inputDir = (payload.imagePath.match(/(.*)[\/\\]/)[1] || "") as string;
  let outputDir = payload.outputPath as string;

  if (saveOutputFolder === true && outputFolderPath) {
    outputDir = outputFolderPath;
  }
  const gpuId = payload.gpuId as string;
  const saveImageAs = payload.saveImageAs as string;
  const scale = payload.scale as string;

  const isDefaultModel = defaultModels.includes(model);

  // COPY IMAGE TO TMP FOLDER

  const fullfileName = payload.imagePath.split(slash).slice(-1)[0] as string;
  const fileName = parse(fullfileName).name;
  const outFile =
    outputDir + slash + fileName + "_upscayl_16x_" + model + "." + saveImageAs;

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

  const onClose2 = (code) => {
    if (!failed2 && !stopped) {
      logit("💯 Done upscaling");
      mainWindow.webContents.send(
        commands.DOUBLE_UPSCAYL_DONE,
        isAlpha ? outFile + ".png" : outFile
      );
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

//------------------------Image Upscayl-----------------------------//
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
    const onClose = () => {
      if (!failed && !stopped) {
        logit("💯 Done upscaling");
        logit("♻ Scaling and converting now...");
        Jimp.read(
          isAlpha ? outFile + ".png" : outFile,
          (err: any, image: any) => {
            if (err) {
              logit("❌ Error converting to PNG: ", err);
              onError(err);
              return;
            }
            image
              .scale(parseInt(payload.scale as string))
              .write(isAlpha ? outFile + ".png" : outFile);
            mainWindow.setProgressBar(-1);
            mainWindow.webContents.send(
              commands.UPSCAYL_DONE,
              isAlpha ? outFile + ".png" : outFile
            );
          }
        );
      }
    };

    upscayl.process.stderr.on("data", onData);
    upscayl.process.on("error", onError);
    upscayl.process.on("close", onClose);
  }
});

//------------------------Upscayl Folder-----------------------------//
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
      logit("❌ INVALID GPU OR FAILED");
      failed = true;
    }
  };
  const onError = (data: any) => {
    mainWindow.webContents.send(
      commands.FOLDER_UPSCAYL_PROGRESS,
      data.toString()
    );
    failed = true;
    return;
  };
  const onClose = () => {
    if (!failed && !stopped) {
      logit("💯 Done upscaling");
      mainWindow.webContents.send(commands.FOLDER_UPSCAYL_DONE, outputDir);
    }
  };

  upscayl.process.stderr.on("data", onData);
  upscayl.process.on("error", onError);
  upscayl.process.on("close", onClose);
});

//------------------------Auto-Update Code-----------------------------//
autoUpdater.autoInstallOnAppQuit = false;

// ! AUTO UPDATE STUFF
// autoUpdater.on("update-available", ({ version, releaseNotes, releaseName }) => {
//   autoUpdater.autoInstallOnAppQuit = false;
//   const dialogOpts = {
//     type: "info",
//     buttons: ["Sweet!"],
//     title: "New Upscayl Update!",
//     message: releaseName as string,
//     detail: `Upscayl ${version} is available! It is being downloaded in the background. Please check GitHub for more details.`,
//   };
//   logit("📲 Update Available", releaseName, releaseNotes);
//   dialog.showMessageBox(dialogOpts).then((returnValue) => {
//     if (returnValue.response === 0) {
//       logit("📲 Update Downloading");
//     }
//   });
// });

autoUpdater.on("update-downloaded", (event) => {
  autoUpdater.autoInstallOnAppQuit = false;
  const dialogOpts: MessageBoxOptions = {
    type: "info",
    buttons: ["Install update", "No Thanks"],
    title: "New Upscayl Update",
    message: event.releaseName as string,
    detail:
      "A new version has been downloaded. Restart the application to apply the updates.",
  };
  logit("✅ Update Downloaded");
  dialog.showMessageBox(dialogOpts).then((returnValue) => {
    if (returnValue.response === 0) {
      autoUpdater.quitAndInstall();
    } else {
      logit("🚫 Update Installation Cancelled");
    }
  });
});

//------------------------Video Upscayl-----------------------------//
// ipcMain.on(commands.UPSCAYL_VIDEO, async (event, payload) => {
//   // Extract the model
//   const model = payload.model;

//   // Extract the Video Directory
//   let videoFileName = payload.videoPath.replace(/^.*[\\\/]/, "");
//   const justFileName = parse(videoFileName).name;

//   let inputDir = payload.videoPath.match(/(.*)[\/\\]/)[1] || "";
//   log.log("🚀 => file: index.ts => line 337 => inputDir", inputDir);

//   // Set the output directory
//   let outputDir = payload.outputPath + "_frames";
//   log.log("🚀 => file: index.ts => line 340 => outputDir", outputDir);

//   let frameExtractionPath = join(inputDir, justFileName + "_f");
//   let frameUpscalePath = join(inputDir, justFileName + "_u");
//   log.log(
//     "🚀 => file: index.ts => line 342 => frameExtractionPath",
//     frameExtractionPath,
//     frameUpscalePath
//   );

//   if (!fs.existsSync(frameExtractionPath)) {
//     fs.mkdirSync(frameExtractionPath, { recursive: true });
//   }
//   if (!fs.existsSync(frameUpscalePath)) {
//     fs.mkdirSync(frameUpscalePath, { recursive: true });
//   }

//   let ffmpegProcess: ChildProcessWithoutNullStreams | null = null;
//   ffmpegProcess = spawn(
//     ffmpeg.path,
//     [
//       "-i",
//       inputDir + slash + videoFileName,
//       frameExtractionPath + slash + "out%d.png",
//     ],
//     {
//       cwd: undefined,
//       detached: false,
//     }
//   );

//   let failed = false;
//   ffmpegProcess?.stderr.on("data", (data: string) => {
//     log.log("🚀 => file: index.ts:420 => data", data.toString());
//     data = data.toString();
//     mainWindow.webContents.send(
//       commands.FFMPEG_VIDEO_PROGRESS,
//       data.toString()
//     );
//   });

//   ffmpegProcess?.on("error", (data: string) => {
//     mainWindow.webContents.send(
//       commands.FFMPEG_VIDEO_PROGRESS,
//       data.toString()
//     );
//     failed = true;
//     return;
//   });

//   // Send done comamnd when
//   ffmpegProcess?.on("close", (code: number) => {
//     if (failed !== true) {
//       log.log("Frame extraction successful!");
//       mainWindow.webContents.send(commands.FFMPEG_VIDEO_DONE, outputDir);

//       // UPSCALE
//       let upscayl: ChildProcessWithoutNullStreams | null = null;
//       upscayl = spawn(
//         execPath("realesrgan"),
//         [
//           "-i",
//           frameExtractionPath,
//           "-o",
//           frameUpscalePath,
//           "-s",
//           4,
//           "-m",
//           modelsPath,
//           "-n",
//           model,
//         ],
//         {
//           cwd: undefined,
//           detached: false,
//         }
//       );

//       upscayl?.stderr.on("data", (data) => {
//         log.log(
//           "🚀 => upscayl.stderr.on => stderr.toString()",
//           data.toString()
//         );
//         data = data.toString();
//         mainWindow.webContents.send(
//           commands.FFMPEG_VIDEO_PROGRESS,
//           data.toString()
//         );
//       });
//     }
//   });
// });
