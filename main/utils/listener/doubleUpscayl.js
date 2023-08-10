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
const getArguments_1 = require("../getArguments");
const jimp_1 = __importDefault(require("jimp"));
function default_1({ mainWindow, slash, logit, childProcesses, stopped, modelsPath, customModelsFolderPath, saveOutputFolder, outputFolderPath, quality, defaultModels, }) {
    electron_1.ipcMain.on(commands_1.default.DOUBLE_UPSCAYL, (event, payload) => __awaiter(this, void 0, void 0, function* () {
        const model = payload.model;
        let inputDir = (payload.imagePath.match(/(.*)[\/\\]/)[1] || "");
        let outputDir = payload.outputPath;
        if (saveOutputFolder === true && outputFolderPath) {
            outputDir = outputFolderPath;
        }
        const gpuId = payload.gpuId;
        const saveImageAs = payload.saveImageAs;
        const isDefaultModel = defaultModels.includes(model);
        // COPY IMAGE TO TMP FOLDER
        const fullfileName = payload.imagePath.split(slash).slice(-1)[0];
        const fileName = (0, path_1.parse)(fullfileName).name;
        const outFile = outputDir +
            slash +
            fileName +
            "_upscayl_16x_" +
            model +
            "." +
            saveImageAs;
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
        // UPSCALE
        let upscayl = (0, upscayl_1.spawnUpscayl)("realesrgan", (0, getArguments_1.getDoubleUpscaleArguments)(inputDir, fullfileName, outFile, isDefaultModel ? modelsPath : customModelsFolderPath !== null && customModelsFolderPath !== void 0 ? customModelsFolderPath : modelsPath, model, gpuId, saveImageAs, scale), logit);
        childProcesses.push(upscayl);
        stopped = false;
        let failed = false;
        let isAlpha = false;
        let failed2 = false;
        const onData = (data) => {
            // CONVERT DATA TO STRING
            data = data.toString();
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
        const onClose2 = (code) => __awaiter(this, void 0, void 0, function* () {
            if (!failed2 && !stopped) {
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
                        mainWindow.webContents.send(commands_1.default.DOUBLE_UPSCAYL_DONE, isAlpha ? outFile + ".png" : outFile);
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
        upscayl.process.on("close", (code) => {
            // IF NOT FAILED
            if (!failed && !stopped) {
                // UPSCALE
                let upscayl2 = (0, upscayl_1.spawnUpscayl)("realesrgan", (0, getArguments_1.getDoubleUpscaleSecondPassArguments)(isAlpha, outFile, isDefaultModel ? modelsPath : customModelsFolderPath !== null && customModelsFolderPath !== void 0 ? customModelsFolderPath : modelsPath, model, gpuId, saveImageAs, scale), logit);
                childProcesses.push(upscayl2);
                upscayl2.process.stderr.on("data", onData2);
                upscayl2.process.on("error", onError2);
                upscayl2.process.on("close", onClose2);
            }
        });
    }));
}
exports.default = default_1;
