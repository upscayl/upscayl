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
function default_1({ mainWindow, customModelsFolderPath, logit, slash, getModels, }) {
    electron_1.ipcMain.handle(commands_1.default.SELECT_CUSTOM_MODEL_FOLDER, (event, message) => __awaiter(this, void 0, void 0, function* () {
        const { canceled, filePaths: folderPaths } = yield electron_1.dialog.showOpenDialog({
            properties: ["openDirectory"],
            title: "Select Custom Models Folder",
            defaultPath: customModelsFolderPath,
        });
        if (canceled) {
            logit("🚫 Select Custom Models Folder Operation Cancelled");
            return null;
        }
        else {
            customModelsFolderPath = folderPaths[0];
            if (!folderPaths[0].endsWith(slash + "models") &&
                !folderPaths[0].endsWith(slash + "models" + slash)) {
                logit("❌ Invalid Custom Models Folder Detected: Not a 'models' folder");
                const options = {
                    type: "error",
                    title: "Invalid Folder",
                    message: "Please make sure that the folder name is 'models' and nothing else.",
                    buttons: ["OK"],
                };
                electron_1.dialog.showMessageBoxSync(options);
                return null;
            }
            mainWindow.webContents.send(commands_1.default.CUSTOM_MODEL_FILES_LIST, getModels(customModelsFolderPath));
            logit("📁 Custom Folder Path: ", customModelsFolderPath);
            return customModelsFolderPath;
        }
    }));
}
exports.default = default_1;
