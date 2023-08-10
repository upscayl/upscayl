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
function default_1({ mainWindow, customModelsFolderPath, logit, getModels, }) {
    electron_1.ipcMain.on(commands_1.default.GET_MODELS_LIST, (event, payload) => __awaiter(this, void 0, void 0, function* () {
        if (payload) {
            customModelsFolderPath = payload;
            logit("📁 Custom Models Folder Path: ", customModelsFolderPath);
            mainWindow.webContents.send(commands_1.default.CUSTOM_MODEL_FILES_LIST, getModels(payload));
        }
    }));
}
exports.default = default_1;
