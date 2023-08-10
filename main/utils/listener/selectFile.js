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
function default_1({ mainWindow, imagePath, logit }) {
    return electron_1.ipcMain.handle(commands_1.default.SELECT_FILE, () => __awaiter(this, void 0, void 0, function* () {
        const { canceled, filePaths } = yield electron_1.dialog.showOpenDialog({
            properties: ["openFile", "multiSelections"],
            title: "Select Image",
            defaultPath: imagePath,
        });
        if (canceled) {
            logit("🚫 File Operation Cancelled");
            return null;
        }
        else {
            imagePath = filePaths[0];
            let isValid = false;
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
                logit("❌ Invalid File Detected");
                const options = {
                    type: "error",
                    title: "Invalid File",
                    message: "The selected file is not a valid image. Make sure you select a '.png', '.jpg', or '.webp' file.",
                };
                electron_1.dialog.showMessageBoxSync(mainWindow, options);
                return null;
            }
            logit("📄 Selected File Path: ", filePaths[0]);
            // CREATE input AND upscaled FOLDER
            return filePaths[0];
        }
    }));
}
exports.default = default_1;
