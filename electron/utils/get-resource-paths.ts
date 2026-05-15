import { join, dirname, resolve } from "path";
import { getPlatform } from "./get-device-specs";
import { app } from "electron";

/**
 * appRootDir is the resources directory inside the unpacked electron app temp directory.
 * resources contains app.asar file, that contains the main and renderer files.
 * We're putting resources/{os}/bin from project inside resources/bin of electron.
 * Same for the models directory as well.
 */
const appRootDir = app.getAppPath();

const binariesPath = app.isPackaged
  ? join(dirname(appRootDir), "bin")
  : join(appRootDir, "resources", getPlatform()!, "bin");

const execPath = resolve(join(binariesPath, "./upscayl-bin"));

const modelsPath = app.isPackaged
  ? resolve(join(dirname(appRootDir), "models"))
  : resolve(join(appRootDir, "resources", "models"));

export { execPath, modelsPath };
