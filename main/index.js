"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const getArguments_1 = require("./utils/getArguments");
// Native
const electron_updater_1 = require("electron-updater");
const getPlatform_1 = __importDefault(require("./getPlatform"));
const upscayl_ffmpeg_1 = __importDefault(require("upscayl-ffmpeg"));
const path_1 = require("path");
const electron_log_1 = __importDefault(require("electron-log"));
const url_1 = require("url");
const fs_1 = __importDefault(require("fs"));
const binaries_1 = require("./binaries");
// Packages
const electron_1 = require("electron");
const upscayl_1 = require("./upscayl");
const electron_next_1 = __importDefault(require("electron-next"));
const electron_is_dev_1 = __importDefault(require("electron-is-dev"));
const commands_1 = __importDefault(require("./commands"));
electron_log_1.default.initialize({ preload: true });
// Prepare the renderer once the app is ready
let mainWindow;
electron_1.app.on("ready", () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, electron_next_1.default)("./renderer");
    electron_log_1.default.info("🚀 ICON PATH: ", (0, path_1.join)(__dirname, "build", "icon.png"));
    electron_log_1.default.info("🚀 UPSCAYL EXEC PATH: ", (0, binaries_1.execPath)(""));
    electron_log_1.default.info("🚀 MODELS PATH: ", binaries_1.modelsPath);
    electron_log_1.default.info("🚀 FFMPEG PATH: ", upscayl_ffmpeg_1.default.path);
    mainWindow = new electron_1.BrowserWindow({
        icon: (0, path_1.join)(__dirname, "build", "icon.png"),
        width: 1300,
        height: 940,
        minHeight: 500,
        minWidth: 500,
        show: false,
        backgroundColor: "#171717",
        webPreferences: {
            nodeIntegration: true,
            webSecurity: false,
            preload: (0, path_1.join)(__dirname, "preload.js"),
        },
    });
    const url = electron_is_dev_1.default
        ? "http://localhost:8000"
        : (0, url_1.format)({
            pathname: (0, path_1.join)(__dirname, "../renderer/out/index.html"),
            protocol: "file:",
            slashes: true,
        });
    mainWindow.setMenuBarVisibility(false);
    mainWindow.loadURL(url);
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        electron_1.shell.openExternal(url);
        return { action: "deny" };
    });
    mainWindow.once("ready-to-show", () => {
        mainWindow.show();
        mainWindow.webContents.setZoomFactor(1);
    });
    if (!electron_is_dev_1.default) {
        electron_updater_1.autoUpdater.checkForUpdates();
    }
}));
// Quit the app once all windows are closed
electron_1.app.on("window-all-closed", electron_1.app.quit);
electron_log_1.default.log(electron_1.app.getAppPath());
// Path variables for file and folder selection
let imagePath = undefined;
let folderPath = undefined;
let customModelsFolderPath = undefined;
//------------------------Select File-----------------------------//
// ! DONT FORGET TO RESTART THE APP WHEN YOU CHANGE CODE HERE
electron_1.ipcMain.handle(commands_1.default.SELECT_FILE, () => __awaiter(void 0, void 0, void 0, function* () {
    const { canceled, filePaths } = yield electron_1.dialog.showOpenDialog({
        properties: ["openFile", "multiSelections"],
        title: "Select Image",
        defaultPath: imagePath,
    });
    if (canceled) {
        electron_log_1.default.log("File Operation Cancelled");
        return null;
    }
    else {
        electron_log_1.default.log("Selected File Path: ", filePaths[0]);
        let isValid = false;
        imagePath = filePaths[0];
        // READ SELECTED FILES
        filePaths.forEach((file) => {
            // log.log("Files in Folder: ", file);
            if (file.endsWith(".png") ||
                file.endsWith(".jpg") ||
                file.endsWith(".jpeg") ||
                file.endsWith(".webp") ||
                file.endsWith(".JPG") ||
                file.endsWith(".PNG") ||
                file.endsWith(".JPEG") ||
                file.endsWith(".WEBP")) {
                isValid = true;
            }
        });
        if (!isValid) {
            const options = {
                type: "error",
                title: "Invalid File",
                message: "The selected file is not a valid image. Make sure you select a '.png', '.jpg', or '.webp' file.",
            };
            electron_1.dialog.showMessageBoxSync(mainWindow, options);
            return null;
        }
        // CREATE input AND upscaled FOLDER
        return filePaths[0];
    }
}));
//------------------------Select Folder-----------------------------//
electron_1.ipcMain.handle(commands_1.default.SELECT_FOLDER, (event, message) => __awaiter(void 0, void 0, void 0, function* () {
    const { canceled, filePaths: folderPaths } = yield electron_1.dialog.showOpenDialog({
        properties: ["openDirectory"],
        defaultPath: folderPath,
    });
    if (canceled) {
        return null;
    }
    else {
        electron_log_1.default.log("Selected Folder Path: ", folderPaths[0]);
        folderPath = folderPaths[0];
        return folderPaths[0];
    }
}));
//------------------------Get Model Names-----------------------------//
const getModels = (folderPath) => {
    let models = [];
    let isValid = false;
    // READ CUSTOM MODELS FOLDER
    fs_1.default.readdirSync(folderPath).forEach((file) => {
        // log.log("Files in Folder: ", file);
        if (file.endsWith(".param") ||
            file.endsWith(".PARAM") ||
            file.endsWith(".bin") ||
            file.endsWith(".BIN")) {
            isValid = true;
            const modelName = file.substring(0, file.lastIndexOf(".")) || file;
            if (!models.includes(modelName)) {
                models.push(modelName);
            }
        }
    });
    if (!isValid) {
        const options = {
            type: "error",
            title: "Invalid Folder",
            message: "The selected folder does not contain valid model files. Make sure you select the folder that ONLY contains '.param' and '.bin' files.",
            buttons: ["OK"],
        };
        electron_1.dialog.showMessageBoxSync(options);
        return null;
    }
    return models;
};
electron_1.ipcMain.on(commands_1.default.GET_MODELS_LIST, (event, payload) => __awaiter(void 0, void 0, void 0, function* () {
    if (payload) {
        mainWindow.webContents.send(commands_1.default.CUSTOM_MODEL_FILES_LIST, getModels(payload));
    }
}));
//------------------------Select Custom Models Folder---------------------//
electron_1.ipcMain.handle(commands_1.default.SELECT_CUSTOM_MODEL_FOLDER, (event, message) => __awaiter(void 0, void 0, void 0, function* () {
    const { canceled, filePaths: folderPaths } = yield electron_1.dialog.showOpenDialog({
        properties: ["openDirectory"],
        title: "Select Custom Models Folder",
        defaultPath: customModelsFolderPath,
    });
    if (canceled) {
        return null;
    }
    else {
        electron_log_1.default.log("Custom Folder Path: ", folderPaths[0]);
        customModelsFolderPath = folderPaths[0];
        mainWindow.webContents.send(commands_1.default.CUSTOM_MODEL_FILES_LIST, getModels(customModelsFolderPath));
        return customModelsFolderPath;
    }
}));
//------------------------Open Folder-----------------------------//
electron_1.ipcMain.on(commands_1.default.OPEN_FOLDER, (event, payload) => __awaiter(void 0, void 0, void 0, function* () {
    electron_log_1.default.log(payload);
    electron_1.shell.openPath(payload);
}));
//------------------------Double Upscayl-----------------------------//
electron_1.ipcMain.on(commands_1.default.DOUBLE_UPSCAYL, (event, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const model = payload.model;
    let inputDir = (payload.imagePath.match(/(.*)[\/\\]/)[1] || "");
    let outputDir = payload.outputPath;
    const gpuId = payload.gpuId;
    const saveImageAs = payload.saveImageAs;
    // COPY IMAGE TO TMP FOLDER
    const platform = (0, getPlatform_1.default)();
    const fullfileName = platform === "win"
        ? payload.imagePath.split("\\").slice(-1)[0]
        : payload.imagePath.split("/").slice(-1)[0];
    const fileName = (0, path_1.parse)(fullfileName).name;
    const fileExt = (0, path_1.parse)(fullfileName).ext;
    const outFile = outputDir + "/" + fileName + "_upscayl_16x_" + model + "." + saveImageAs;
    // UPSCALE
    let upscayl = (0, upscayl_1.spawnUpscayl)("realesrgan", (0, getArguments_1.getDoubleUpscaleArguments)(inputDir, fullfileName, outFile, binaries_1.modelsPath, model, gpuId, saveImageAs));
    let failed = false;
    let isAlpha = false;
    let failed2 = false;
    const onData = (data) => {
        // CONVERT DATA TO STRING
        data = data.toString();
        // PRINT TO CONSOLE
        electron_log_1.default.log(data);
        // SEND UPSCAYL PROGRESS TO RENDERER
        mainWindow.webContents.send(commands_1.default.DOUBLE_UPSCAYL_PROGRESS, data);
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
        mainWindow.webContents.send(commands_1.default.DOUBLE_UPSCAYL_PROGRESS, data);
        // SET FAILED TO TRUE
        failed = true;
        return;
    };
    const onData2 = (data) => {
        // CONVERT DATA TO STRING
        data = data.toString();
        // PRINT TO CONSOLE
        electron_log_1.default.log(data);
        // SEND UPSCAYL PROGRESS TO RENDERER
        mainWindow.webContents.send(commands_1.default.DOUBLE_UPSCAYL_PROGRESS, data);
        // IF PROGRESS HAS ERROR, UPSCAYL FAILED
        if (data.includes("invalid gpu") || data.includes("failed")) {
            failed2 = true;
        }
    };
    const onError2 = (data) => {
        data.toString();
        // SEND UPSCAYL PROGRESS TO RENDERER
        mainWindow.webContents.send(commands_1.default.DOUBLE_UPSCAYL_PROGRESS, data);
        // SET FAILED TO TRUE
        failed2 = true;
        return;
    };
    const onClose2 = (code) => {
        if (!failed2) {
            electron_log_1.default.log("Done upscaling");
            mainWindow.webContents.send(commands_1.default.DOUBLE_UPSCAYL_DONE, isAlpha ? outFile + ".png" : outFile);
        }
    };
    upscayl.process.stderr.on("data", onData);
    upscayl.process.on("error", onError);
    upscayl.process.on("close", (code) => {
        // IF NOT FAILED
        if (!failed) {
            // UPSCALE
            let upscayl2 = (0, upscayl_1.spawnUpscayl)("realesrgan", (0, getArguments_1.getDoubleUpscaleSecondPassArguments)(isAlpha, outFile, binaries_1.modelsPath, model, gpuId, saveImageAs));
            upscayl2.process.stderr.on("data", onData2);
            upscayl2.process.on("error", onError2);
            upscayl2.process.on("close", onClose2);
        }
    });
}));
//------------------------Image Upscayl-----------------------------//
electron_1.ipcMain.on(commands_1.default.UPSCAYL, (event, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const model = payload.model;
    const scale = payload.scaleFactor;
    const gpuId = payload.gpuId;
    const saveImageAs = payload.saveImageAs;
    let inputDir = (payload.imagePath.match(/(.*)[\/\\]/)[1] || "");
    let outputDir = payload.outputPath;
    // COPY IMAGE TO TMP FOLDER
    const fullfileName = payload.imagePath.replace(/^.*[\\\/]/, "");
    const fileName = (0, path_1.parse)(fullfileName).name;
    electron_log_1.default.log("🚀 => fileName", fileName);
    const fileExt = (0, path_1.parse)(fullfileName).ext;
    electron_log_1.default.log("🚀 => fileExt", fileExt);
    const outFile = outputDir +
        "/" +
        fileName +
        "_upscayl_" +
        scale +
        "x_" +
        model +
        "." +
        saveImageAs;
    // UPSCALE
    if (fs_1.default.existsSync(outFile)) {
        // If already upscayled, just output that file
        mainWindow.webContents.send(commands_1.default.UPSCAYL_DONE, outFile);
    }
    else {
        const upscayl = (0, upscayl_1.spawnUpscayl)("realesrgan", (0, getArguments_1.getSingleImageArguments)(inputDir, fullfileName, outFile, binaries_1.modelsPath, model, scale, gpuId, saveImageAs));
        let isAlpha = false;
        let failed = false;
        const onData = (data) => {
            electron_log_1.default.log("image upscayl: ", data.toString());
            data = data.toString();
            mainWindow.webContents.send(commands_1.default.UPSCAYL_PROGRESS, data.toString());
            if (data.includes("invalid gpu") || data.includes("failed")) {
                failed = true;
            }
            if (data.includes("has alpha channel")) {
                electron_log_1.default.log("INCLUDES ALPHA CHANNEL, CHANGING OUTFILE NAME!");
                isAlpha = true;
            }
        };
        const onError = (data) => {
            mainWindow.webContents.send(commands_1.default.UPSCAYL_PROGRESS, data.toString());
            failed = true;
            return;
        };
        const onClose = () => {
            if (failed !== true) {
                electron_log_1.default.log("Done upscaling");
                mainWindow.webContents.send(commands_1.default.UPSCAYL_DONE, isAlpha ? outFile + ".png" : outFile);
            }
        };
        upscayl.process.stderr.on("data", onData);
        upscayl.process.on("error", onError);
        upscayl.process.on("close", onClose);
    }
}));
//------------------------Upscayl Folder-----------------------------//
electron_1.ipcMain.on(commands_1.default.FOLDER_UPSCAYL, (event, payload) => __awaiter(void 0, void 0, void 0, function* () {
    // GET THE MODEL
    const model = payload.model;
    const gpuId = payload.gpuId;
    const saveImageAs = payload.saveImageAs;
    // GET THE IMAGE DIRECTORY
    let inputDir = payload.batchFolderPath;
    // GET THE OUTPUT DIRECTORY
    let outputDir = payload.outputPath;
    if (!fs_1.default.existsSync(outputDir)) {
        fs_1.default.mkdirSync(outputDir, { recursive: true });
    }
    // UPSCALE
    const upscayl = (0, upscayl_1.spawnUpscayl)("realesrgan", (0, getArguments_1.getBatchArguments)(inputDir, outputDir, binaries_1.modelsPath, model, gpuId, saveImageAs));
    let failed = false;
    const onData = (data) => {
        electron_log_1.default.log("🚀 => upscayl.stderr.on => stderr.toString()", data.toString());
        data = data.toString();
        mainWindow.webContents.send(commands_1.default.FOLDER_UPSCAYL_PROGRESS, data.toString());
        if (data.includes("invalid gpu") || data.includes("failed")) {
            failed = true;
        }
    };
    const onError = (data) => {
        mainWindow.webContents.send(commands_1.default.FOLDER_UPSCAYL_PROGRESS, data.toString());
        failed = true;
        return;
    };
    const onClose = () => {
        if (failed !== true) {
            electron_log_1.default.log("Done upscaling");
            mainWindow.webContents.send(commands_1.default.FOLDER_UPSCAYL_DONE, outputDir);
        }
    };
    upscayl.process.stderr.on("data", onData);
    upscayl.process.on("error", onError);
    upscayl.process.on("close", onClose);
}));
//------------------------Auto-Update Code-----------------------------//
// ! AUTO UPDATE STUFF
electron_updater_1.autoUpdater.on("update-available", ({ releaseNotes, releaseName }) => {
    const dialogOpts = {
        type: "info",
        buttons: ["Ok cool"],
        title: "New Upscayl Update",
        message: releaseName,
        detail: "A new version is being downloaded. Please check GitHub for more details.",
    };
    electron_1.dialog.showMessageBox(dialogOpts).then((returnValue) => { });
});
electron_updater_1.autoUpdater.on("update-downloaded", (event) => {
    const dialogOpts = {
        type: "info",
        buttons: ["Restart", "Later"],
        title: "New Upscayl Update",
        message: event.releaseName,
        detail: "A new version has been downloaded. Restart the application to apply the updates.",
    };
    electron_1.dialog.showMessageBox(dialogOpts).then((returnValue) => {
        if (returnValue.response === 0)
            electron_updater_1.autoUpdater.quitAndInstall();
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
//       inputDir + "/" + videoFileName,
//       frameExtractionPath + "/" + "out%d.png",
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
