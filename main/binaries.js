"use strict";
/*
  appRootDir is the resources directory inside the unpacked electron app temp directory.
  resources contains app.asar file, that contains the main and renderer files.
  We're putting resources/{os}/bin from project inside resources/bin of electron. Same for the models directory as well.
*/
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.modelsPath = exports.execPath = void 0;
const path_1 = require("path");
const getPlatform_1 = __importDefault(require("./getPlatform"));
const electron_is_dev_1 = __importDefault(require("electron-is-dev"));
const electron_1 = require("electron");
const appRootDir = electron_1.app.getAppPath();
const binariesPath = electron_is_dev_1.default
    ? (0, path_1.join)(appRootDir, "resources", (0, getPlatform_1.default)(), "bin")
    : (0, path_1.join)((0, path_1.dirname)(appRootDir), "bin");
const execPath = (execName) => (0, path_1.resolve)((0, path_1.join)(binariesPath, `./upscayl-${execName}`));
exports.execPath = execPath;
const modelsPath = electron_is_dev_1.default
    ? (0, path_1.resolve)((0, path_1.join)(appRootDir, "resources", "models"))
    : (0, path_1.resolve)((0, path_1.join)((0, path_1.dirname)(appRootDir), "models"));
exports.modelsPath = modelsPath;
