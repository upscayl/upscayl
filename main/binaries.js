/* 
  appRootDir is the resources directory inside the unpacked electron app temp directory.
  resources contains app.asar file, that contains the main and renderer files.
  We're putting resources/{os}/bin from project inside resources/bin of electron. Same for the models directory as well.
*/

const { join, dirname, resolve } = require("path");
const { getPlatform } = require("./getPlatform");
const appRootDir = require("app-root-dir");
const isDev = require("electron-is-dev");

const binariesPath = isDev
  ? join(appRootDir.get(), "resources", getPlatform(), "bin")
  : join(dirname(appRootDir.get()), "bin");

const execPath = (execName) =>
  resolve(join(binariesPath, `./upscayl-${execName}`));
  
const modelsPath = isDev
  ? resolve(join(appRootDir.get(), "resources", "models"))
  : resolve(join(dirname(appRootDir.get()), "models"));

module.exports = { execPath, modelsPath };
