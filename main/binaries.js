const path = require("path");
const { rootPath } = require("electron-root-path");
const { isPackaged } = require("electron-is-packaged");
const { getPlatform } = require("./getPlatform");
const {app} = require('electron')

const IS_PROD = process.env.NODE_ENV === "production";

const binariesPath = path.join(app.getAppPath(), "../", getPlatform(), "./bin");

const execPath = path.resolve(path.join(binariesPath, "./upscayl"));
const modelsPath = path.resolve(path.join(binariesPath, "./models"));

module.exports = { execPath, modelsPath };
