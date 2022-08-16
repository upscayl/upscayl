const path = require("path");
const { rootPath } = require("electron-root-path");
const { isPackaged } = require("electron-is-packaged");
const { getPlatform } = require("./getPlatform");

const IS_PROD = process.env.NODE_ENV === "production";

const binariesPath =
  IS_PROD && isPackaged // the path to a bundled electron app.
    ? path.join(rootPath, "./Contents", "./Resources", "./bin")
    : path.join(rootPath, "./resources", getPlatform(), "./bin");

const execPath = path.resolve(path.join(binariesPath, "./upscayl"));
const modelsPath = path.resolve(path.join(binariesPath, "./models"));

module.exports = { execPath, modelsPath };
