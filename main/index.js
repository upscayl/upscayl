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
// Native
const path_1 = require("path");
const url_1 = require("url");
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
const electron_updater_1 = require("electron-updater");
const getPlatform_1 = __importDefault(require("./getPlatform"));
const upscayl_ffmpeg_1 = __importDefault(require("upscayl-ffmpeg"));
const binaries_1 = require("./binaries");
// Packages
const electron_1 = require("electron");
const electron_is_dev_1 = __importDefault(require("electron-is-dev"));
const electron_next_1 = __importDefault(require("electron-next"));
const commands_1 = __importDefault(require("./commands"));
const upscayl_1 = require("./upscayl");
// Prepare the renderer once the app is ready
let mainWindow;
electron_1.app.on("ready", () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, electron_next_1.default)("./renderer");
    console.log("🚀 ICON PATH: ", (0, path_1.join)(__dirname, "build", "icon.png"));
    console.log("🚀 UPSCAYL EXEC PATH: ", (0, binaries_1.execPath)(""));
    console.log("🚀 MODELS PATH: ", binaries_1.modelsPath);
    console.log("🚀 FFMPEG PATH: ", upscayl_ffmpeg_1.default.path);
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
console.log(electron_1.app.getAppPath());
//------------------------Select File-----------------------------//
// ! DONT FORGET TO RESTART THE APP WHEN YOU CHANGE CODE HERE
electron_1.ipcMain.handle(commands_1.default.SELECT_FILE, () => __awaiter(void 0, void 0, void 0, function* () {
    const { canceled, filePaths } = yield electron_1.dialog.showOpenDialog({
        properties: ["openFile", "multiSelections"],
    });
    if (canceled) {
        console.log("operation cancelled");
        return "cancelled";
    }
    else {
        console.log(filePaths[0]);
        // CREATE input AND upscaled FOLDER
        return filePaths[0];
    }
}));
//------------------------Select Folder-----------------------------//
electron_1.ipcMain.handle(commands_1.default.SELECT_FOLDER, (event, message) => __awaiter(void 0, void 0, void 0, function* () {
    const { canceled, filePaths } = yield electron_1.dialog.showOpenDialog({
        properties: ["openDirectory"],
    });
    if (canceled) {
        console.log("operation cancelled");
        return "cancelled";
    }
    else {
        console.log(filePaths[0]);
        return filePaths[0];
    }
}));
//------------------------Open Folder-----------------------------//
electron_1.ipcMain.on(commands_1.default.OPEN_FOLDER, (event, payload) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(payload);
    electron_1.shell.openPath(payload);
}));
//------------------------Double Upscayl-----------------------------//
electron_1.ipcMain.on(commands_1.default.DOUBLE_UPSCAYL, (event, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const model = payload.model;
    let inputDir = payload.imagePath.match(/(.*)[\/\\]/)[1] || "";
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
    const outFile = outputDir + "/" + fileName + "_upscayl_8x_" + model + "." + saveImageAs;
    const commandArguments = [
        "-i",
        inputDir + "/" + fullfileName,
        "-o",
        outFile,
        "-s",
        4,
        "-m",
        binaries_1.modelsPath,
        "-n",
        model,
        gpuId ? `-g ${gpuId}` : "",
        "-f",
        saveImageAs,
    ];
    // UPSCALE
    let upscayl = (0, upscayl_1.spawnUpscayl)("realesrgan", commandArguments).process;
    let failed = false;
    let isAlpha = false;
    // TAKE UPSCAYL OUTPUT
    upscayl.stderr.on("data", (data) => {
        // CONVERT DATA TO STRING
        data = data.toString();
        // PRINT TO CONSOLE
        console.log(data);
        // SEND UPSCAYL PROGRESS TO RENDERER
        mainWindow.webContents.send(commands_1.default.DOUBLE_UPSCAYL_PROGRESS, data);
        // IF PROGRESS HAS ERROR, UPSCAYL FAILED
        if (data.includes("invalid gpu") || data.includes("failed")) {
            failed = true;
        }
        // IF IMAGE HAS ALPHA CHANNEL
        if (data.includes("has alpha channel")) {
            isAlpha = true;
        }
    });
    // IF ERROR
    upscayl.on("error", (data) => {
        data.toString();
        // SEND UPSCAYL PROGRESS TO RENDERER
        mainWindow.webContents.send(commands_1.default.DOUBLE_UPSCAYL_PROGRESS, data);
        // SET FAILED TO TRUE
        failed = true;
        return;
    });
    // ON UPSCAYL DONE
    upscayl.on("close", () => {
        // IF NOT FAILED
        if (!failed) {
            const commandArguments2 = [
                "-i",
                isAlpha ? outFile + ".png" : outFile,
                "-o",
                isAlpha ? outFile + ".png" : outFile,
                "-s",
                4,
                "-m",
                binaries_1.modelsPath,
                "-n",
                model,
                gpuId ? `-g ${gpuId}` : "",
                "-f",
                isAlpha ? "" : saveImageAs,
            ];
            // UPSCALE
            let upscayl2 = (0, upscayl_1.spawnUpscayl)("realesrgan", commandArguments2).process;
            let failed2 = false;
            // TAKE UPSCAYL OUTPUT
            upscayl2.stderr.on("data", (data) => {
                // CONVERT DATA TO STRING
                data = data.toString();
                // PRINT TO CONSOLE
                console.log(data);
                // SEND UPSCAYL PROGRESS TO RENDERER
                mainWindow.webContents.send(commands_1.default.DOUBLE_UPSCAYL_PROGRESS, data);
                // IF PROGRESS HAS ERROR, UPSCAYL FAILED
                if (data.includes("invalid gpu") || data.includes("failed")) {
                    failed2 = true;
                }
            });
            // IF ERROR
            upscayl2.on("error", (data) => {
                data.toString();
                // SEND UPSCAYL PROGRESS TO RENDERER
                mainWindow.webContents.send(commands_1.default.DOUBLE_UPSCAYL_PROGRESS, data);
                // SET FAILED TO TRUE
                failed2 = true;
                return;
            });
            upscayl2.on("close", (code) => {
                if (!failed2) {
                    console.log("Done upscaling");
                    mainWindow.webContents.send(commands_1.default.DOUBLE_UPSCAYL_DONE, isAlpha ? outFile + ".png" : outFile);
                }
            });
        }
    });
}));
//------------------------Image Upscayl-----------------------------//
electron_1.ipcMain.on(commands_1.default.UPSCAYL, (event, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const model = payload.model;
    const scale = payload.scaleFactor;
    const gpuId = payload.gpuId;
    const saveImageAs = payload.saveImageAs;
    let inputDir = payload.imagePath.match(/(.*)[\/\\]/)[1] || "";
    let outputDir = payload.outputPath;
    // COPY IMAGE TO TMP FOLDER
    const fullfileName = payload.imagePath.replace(/^.*[\\\/]/, "");
    const fileName = (0, path_1.parse)(fullfileName).name;
    console.log("🚀 => fileName", fileName);
    const fileExt = (0, path_1.parse)(fullfileName).ext;
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
    if (fs_1.default.existsSync(outFile)) {
        // If already upscayled, just output that file
        mainWindow.webContents.send(commands_1.default.UPSCAYL_DONE, outFile);
    }
    else {
        let upscayl;
        const defaultArguments = [
            "-i",
            inputDir + "/" + fullfileName,
            "-o",
            outFile,
            "-s",
            scale === 2 ? 4 : scale,
            "-m",
            binaries_1.modelsPath,
            "-n",
            model,
            gpuId ? `-g ${gpuId}` : "",
            "-f",
            saveImageAs,
        ];
        const sharpenArguments = [
            "-i",
            inputDir + "/" + fullfileName,
            "-o",
            outFile,
            "-s",
            scale,
            "-x",
            "-m",
            binaries_1.modelsPath + "/" + model,
            gpuId ? `-g ${gpuId}` : "",
            "-f",
            saveImageAs,
        ];
        switch (model) {
            default:
                upscayl = (0, upscayl_1.spawnUpscayl)("realesrgan", defaultArguments);
                break;
            case "models-DF2K":
                upscayl = (0, upscayl_1.spawnUpscayl)("realsr", sharpenArguments);
                break;
        }
        let isAlpha = false;
        let failed = false;
        const onData = (data) => {
            console.log("🚀 => upscayl.stderr.on => stderr.toString()", data.toString());
            data = data.toString();
            mainWindow.webContents.send(commands_1.default.UPSCAYL_PROGRESS, data.toString());
            if (data.includes("invalid gpu") || data.includes("failed")) {
                failed = true;
            }
            if (data.includes("has alpha channel")) {
                console.log("INCLUDES ALPHA CHANNEL, CHANGING OUTFILE NAME!");
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
                console.log("Done upscaling");
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
    console.log("🚀 => file: index.ts => line 471 => inputDir", inputDir);
    // GET THE OUTPUT DIRECTORY
    let outputDir = model.includes("models-DF2K")
        ? payload.outputPath + "_sharpened"
        : payload.outputPath;
    console.log("🚀 => file: index.ts => line 474 => outputDir", outputDir);
    if (!fs_1.default.existsSync(outputDir)) {
        fs_1.default.mkdirSync(outputDir, { recursive: true });
    }
    const commandArguments = [
        "-i",
        inputDir,
        "-o",
        outputDir,
        "-s",
        4,
        "-m",
        binaries_1.modelsPath,
        "-n",
        model,
        gpuId ? `-g ${gpuId}` : "",
        "-f",
        saveImageAs,
    ];
    const sharpenArguments = [
        "-i",
        inputDir,
        "-o",
        outputDir,
        "-s",
        4,
        "-x",
        "-m",
        binaries_1.modelsPath + "/" + model,
        gpuId ? `-g ${gpuId}` : "",
        "-f",
        saveImageAs,
    ];
    // UPSCALE
    let upscayl = null;
    switch (model) {
        default:
            upscayl = (0, upscayl_1.spawnUpscayl)("realesrgan", commandArguments).process;
            break;
        case "models-DF2K":
            upscayl = (0, upscayl_1.spawnUpscayl)("realsr", sharpenArguments).process;
            break;
    }
    let failed = false;
    upscayl === null || upscayl === void 0 ? void 0 : upscayl.stderr.on("data", (data) => {
        console.log("🚀 => upscayl.stderr.on => stderr.toString()", data.toString());
        data = data.toString();
        mainWindow.webContents.send(commands_1.default.FOLDER_UPSCAYL_PROGRESS, data.toString());
        if (data.includes("invalid gpu") || data.includes("failed")) {
            failed = true;
        }
    });
    upscayl === null || upscayl === void 0 ? void 0 : upscayl.on("error", (data) => {
        mainWindow.webContents.send(commands_1.default.FOLDER_UPSCAYL_PROGRESS, data.toString());
        failed = true;
        return;
    });
    // Send done comamnd when
    upscayl === null || upscayl === void 0 ? void 0 : upscayl.on("close", (code) => {
        if (failed !== true) {
            console.log("Done upscaling");
            mainWindow.webContents.send(commands_1.default.FOLDER_UPSCAYL_DONE, outputDir);
        }
    });
}));
//------------------------Video Upscayl-----------------------------//
electron_1.ipcMain.on(commands_1.default.UPSCAYL_VIDEO, (event, payload) => __awaiter(void 0, void 0, void 0, function* () {
    // Extract the model
    const model = payload.model;
    // Extract the Video Directory
    let videoFileName = payload.videoPath.replace(/^.*[\\\/]/, "");
    const justFileName = (0, path_1.parse)(videoFileName).name;
    let inputDir = payload.videoPath.match(/(.*)[\/\\]/)[1] || "";
    console.log("🚀 => file: index.ts => line 337 => inputDir", inputDir);
    // Set the output directory
    let outputDir = payload.outputPath + "_frames";
    console.log("🚀 => file: index.ts => line 340 => outputDir", outputDir);
    let frameExtractionPath = (0, path_1.join)(inputDir, justFileName + "_f");
    let frameUpscalePath = (0, path_1.join)(inputDir, justFileName + "_u");
    console.log("🚀 => file: index.ts => line 342 => frameExtractionPath", frameExtractionPath, frameUpscalePath);
    if (!fs_1.default.existsSync(frameExtractionPath)) {
        fs_1.default.mkdirSync(frameExtractionPath, { recursive: true });
    }
    if (!fs_1.default.existsSync(frameUpscalePath)) {
        fs_1.default.mkdirSync(frameUpscalePath, { recursive: true });
    }
    let ffmpegProcess = null;
    ffmpegProcess = (0, child_process_1.spawn)(upscayl_ffmpeg_1.default.path, [
        "-i",
        inputDir + "/" + videoFileName,
        frameExtractionPath + "/" + "out%d.png",
    ], {
        cwd: undefined,
        detached: false,
    });
    let failed = false;
    ffmpegProcess === null || ffmpegProcess === void 0 ? void 0 : ffmpegProcess.stderr.on("data", (data) => {
        console.log("🚀 => file: index.ts:420 => data", data.toString());
        data = data.toString();
        mainWindow.webContents.send(commands_1.default.FFMPEG_VIDEO_PROGRESS, data.toString());
    });
    ffmpegProcess === null || ffmpegProcess === void 0 ? void 0 : ffmpegProcess.on("error", (data) => {
        mainWindow.webContents.send(commands_1.default.FFMPEG_VIDEO_PROGRESS, data.toString());
        failed = true;
        return;
    });
    // Send done comamnd when
    ffmpegProcess === null || ffmpegProcess === void 0 ? void 0 : ffmpegProcess.on("close", (code) => {
        if (failed !== true) {
            console.log("Frame extraction successful!");
            mainWindow.webContents.send(commands_1.default.FFMPEG_VIDEO_DONE, outputDir);
            // UPSCALE
            let upscayl = null;
            upscayl = (0, child_process_1.spawn)((0, binaries_1.execPath)("realesrgan"), [
                "-i",
                frameExtractionPath,
                "-o",
                frameUpscalePath,
                "-s",
                4,
                "-m",
                binaries_1.modelsPath,
                "-n",
                model,
            ], {
                cwd: undefined,
                detached: false,
            });
            upscayl === null || upscayl === void 0 ? void 0 : upscayl.stderr.on("data", (data) => {
                console.log("🚀 => upscayl.stderr.on => stderr.toString()", data.toString());
                data = data.toString();
                mainWindow.webContents.send(commands_1.default.FFMPEG_VIDEO_PROGRESS, data.toString());
            });
        }
    });
}));
//------------------------Auto-Update Code-----------------------------//
// ! AUTO UPDATE STUFF
electron_updater_1.autoUpdater.on("update-available", ({ releaseNotes, releaseName }) => {
    const dialogOpts = {
        type: "info",
        buttons: ["Ok"],
        title: "Application Update",
        message: process.platform === "win32"
            ? releaseNotes
            : releaseName,
        detail: "A new version is being downloaded.",
    };
    electron_1.dialog.showMessageBox(dialogOpts).then((returnValue) => { });
});
electron_updater_1.autoUpdater.on("update-downloaded", (event) => {
    const dialogOpts = {
        type: "info",
        buttons: ["Restart", "Later"],
        title: "Application Update",
        message: process.platform === "win32"
            ? event.releaseNotes
            : event.releaseName,
        detail: "A new version has been downloaded. Restart the application to apply the updates.",
    };
    electron_1.dialog.showMessageBox(dialogOpts).then((returnValue) => {
        if (returnValue.response === 0)
            electron_updater_1.autoUpdater.quitAndInstall();
    });
});
