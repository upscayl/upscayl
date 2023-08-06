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
const upscayl_1 = require("../../upscayl");
const getArguments_1 = require("../getArguments");
const fs_1 = __importDefault(require("fs"));
function default_1(mainWindow, logit, childProcesses, stopped, modelsPath, customModelsFolderPath, saveOutputFolder, outputFolderPath, defaultModels) {
    //------------------------Upscayl Folder-----------------------------//
    electron_1.ipcMain.on(commands_1.default.FOLDER_UPSCAYL, (event, payload) => __awaiter(this, void 0, void 0, function* () {
        // GET THE MODEL
        const model = payload.model;
        const gpuId = payload.gpuId;
        const saveImageAs = payload.saveImageAs;
        const scale = payload.scale;
        // GET THE IMAGE DIRECTORY
        let inputDir = payload.batchFolderPath;
        // GET THE OUTPUT DIRECTORY
        let outputDir = payload.outputPath;
        if (saveOutputFolder === true && outputFolderPath) {
            outputDir = outputFolderPath;
        }
        if (!fs_1.default.existsSync(outputDir)) {
            fs_1.default.mkdirSync(outputDir, { recursive: true });
        }
        const isDefaultModel = defaultModels.includes(model);
        // UPSCALE
        const upscayl = (0, upscayl_1.spawnUpscayl)("realesrgan", (0, getArguments_1.getBatchArguments)(inputDir, outputDir, isDefaultModel ? modelsPath : customModelsFolderPath !== null && customModelsFolderPath !== void 0 ? customModelsFolderPath : modelsPath, model, gpuId, saveImageAs, scale), logit);
        childProcesses.push(upscayl);
        stopped = false;
        let failed = false;
        const onData = (data) => {
            data = data.toString();
            mainWindow.webContents.send(commands_1.default.FOLDER_UPSCAYL_PROGRESS, data.toString());
            if (data.includes("invalid gpu") || data.includes("failed")) {
                logit("❌ INVALID GPU OR INVALID FILES IN FOLDER - FAILED");
                failed = true;
                upscayl.kill();
            }
        };
        const onError = (data) => {
            mainWindow.webContents.send(commands_1.default.FOLDER_UPSCAYL_PROGRESS, data.toString());
            failed = true;
            upscayl.kill();
            return;
        };
        const onClose = () => {
            if (!failed && !stopped) {
                logit("💯 Done upscaling");
                mainWindow.webContents.send(commands_1.default.FOLDER_UPSCAYL_DONE, outputDir);
            }
            else {
                upscayl.kill();
            }
        };
        upscayl.process.stderr.on("data", onData);
        upscayl.process.on("error", onError);
        upscayl.process.on("close", onClose);
    }));
}
exports.default = default_1;
