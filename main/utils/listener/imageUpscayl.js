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
const electron_1 = require("electron");
const commands_1 = __importDefault(require("../../commands"));
const path_1 = require("path");
const upscayl_1 = require("../../upscayl");
const jimp_1 = __importDefault(require("jimp"));
const getArguments_1 = require("../getArguments");
const fs_1 = __importDefault(require("fs"));
function default_1({ mainWindow, slash, logit, childProcesses, stopped, modelsPath, customModelsFolderPath, saveOutputFolder, outputFolderPath, quality, defaultModels, folderPath, }) {
    electron_1.ipcMain.on(commands_1.default.UPSCAYL, (event, payload) => __awaiter(this, void 0, void 0, function* () {
        const model = payload.model;
        const gpuId = payload.gpuId;
        const saveImageAs = payload.saveImageAs;
        let inputDir = (payload.imagePath.match(/(.*)[\/\\]/)[1] || "");
        let outputDir = folderPath || payload.outputPath;
        if (saveOutputFolder === true && outputFolderPath) {
            outputDir = outputFolderPath;
        }
        const isDefaultModel = defaultModels.includes(model);
        const fullfileName = payload.imagePath.replace(/^.*[\\\/]/, "");
        const fileName = (0, path_1.parse)(fullfileName).name;
        const fileExt = (0, path_1.parse)(fullfileName).ext;
        let scale = "4";
        if (model.includes("x2")) {
            scale = "2";
        }
        else if (model.includes("x3")) {
            scale = "3";
        }
        else {
            scale = "4";
        }
        const outFile = outputDir +
            slash +
            fileName +
            "_upscayl_" +
            payload.scale +
            "x_" +
            model +
            "." +
            saveImageAs;
        // UPSCALE
        if (fs_1.default.existsSync(outFile)) {
            // If already upscayled, just output that file
            logit("✅ Already upscayled at: ", outFile);
            mainWindow.webContents.send(commands_1.default.UPSCAYL_DONE, outFile);
        }
        else {
            const upscayl = (0, upscayl_1.spawnUpscayl)("realesrgan", (0, getArguments_1.getSingleImageArguments)(inputDir, fullfileName, outFile, isDefaultModel ? modelsPath : customModelsFolderPath !== null && customModelsFolderPath !== void 0 ? customModelsFolderPath : modelsPath, model, scale, gpuId, saveImageAs), logit);
            childProcesses.push(upscayl);
            stopped = false;
            let isAlpha = false;
            let failed = false;
            const onData = (data) => {
                logit("image upscayl: ", data.toString());
                mainWindow.setProgressBar(parseFloat(data.slice(0, data.length)) / 100);
                data = data.toString();
                mainWindow.webContents.send(commands_1.default.UPSCAYL_PROGRESS, data.toString());
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
                mainWindow.webContents.send(commands_1.default.UPSCAYL_PROGRESS, data.toString());
                failed = true;
                return;
            };
            const onClose = () => __awaiter(this, void 0, void 0, function* () {
                if (!failed && !stopped) {
                    logit("💯 Done upscaling");
                    logit("♻ Scaling and converting now...");
                    const originalImage = yield jimp_1.default.read(inputDir + slash + fullfileName);
                    try {
                        const newImage = yield jimp_1.default.read(isAlpha ? outFile + ".png" : outFile);
                        try {
                            newImage
                                .scaleToFit(originalImage.getWidth() * parseInt(payload.scale), originalImage.getHeight() * parseInt(payload.scale))
                                .quality(100 - quality)
                                .write(isAlpha ? outFile + ".png" : outFile);
                            mainWindow.setProgressBar(-1);
                            mainWindow.webContents.send(commands_1.default.UPSCAYL_DONE, isAlpha ? outFile + ".png" : outFile);
                        }
                        catch (error) {
                            logit("❌ Error converting to PNG: ", error);
                            onError(error);
                        }
                    }
                    catch (error) {
                        logit("❌ Error reading original image metadata", error);
                        onError(error);
                    }
                }
            });
            upscayl.process.stderr.on("data", onData);
            upscayl.process.on("error", onError);
            upscayl.process.on("close", onClose);
        }
    }));
}
exports.default = default_1;
