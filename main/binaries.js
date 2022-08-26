const { join, dirname } = require("path");
const path = require("path");
const { getPlatform } = require("./getPlatform");
const appRootDir = require("app-root-dir");
const isDev = require("electron-is-dev");

const binariesPath = isDev
  ? join(appRootDir.get(), "resources", getPlatform(), "bin")
  : join(dirname(appRootDir.get()), "..", "Resources", "bin");

const execPath = path.resolve(path.join(binariesPath, "./upscayl"));
const modelsPath = isDev 
  ? path.resolve(path.join(binariesPath, "../../models"))
  : path.resolve(path.join(binariesPath, "../models"))

module.exports = { execPath, modelsPath };
