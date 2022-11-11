/* 
  appRootDir is the resources directory inside the unpacked electron app temp directory.
  resources contains app.asar file, that contains the main and renderer files.
  We're putting resources/{os}/bin from project inside resources/bin of electron. Same for the models directory as well.
*/

import { join, dirname, resolve } from "path";
import getPlatform from "./getPlatform";
import isDev from "electron-is-dev";
import { app } from "electron";

const appRootDir = app.getAppPath();

const binariesPath = isDev
  ? join(appRootDir, "resources", getPlatform()!, "bin")
  : join(dirname(appRootDir), "bin");

const execPath = (execName) =>
  resolve(join(binariesPath, `./upscayl-${execName}`));

const modelsPath = isDev
  ? resolve(join(appRootDir, "resources", "models"))
  : resolve(join(dirname(appRootDir), "models"));

export { execPath, modelsPath };
