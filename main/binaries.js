const { join, dirname } = require("path");
const path = require("path");
const { getPlatform } = require("./getPlatform");
const appRootDir = require("app-root-dir");

const IS_PROD = process.env.NODE_ENV === "production";

const binariesPath = IS_PROD
  ? join(dirname(appRootDir.get()), "..", "Resources", "bin")
  : join(appRootDir.get(), "resources", getPlatform(), "bin");

const execPath = path.resolve(path.join(binariesPath, "./upscayl"));
const modelsPath = path.resolve(path.join(binariesPath, "./models"));

module.exports = { execPath, modelsPath };
