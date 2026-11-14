import { autoUpdater } from "electron-updater";
import log from "electron-log";
import { app, ipcMain } from "electron";
import { ELECTRON_COMMANDS } from "../common/electron-commands";
import logit from "./utils/logit";
import openFolder from "./commands/open-folder";
import stop from "./commands/stop";
import selectFolder from "./commands/select-folder";
import selectFile from "./commands/select-file";
import getModelsList from "./commands/get-models-list";
import customModelsSelect from "./commands/custom-models-select";
import imageUpscayl from "./commands/image-upscayl";
import {
  createMainWindow,
  getMainWindow,
  restrictPagePermissions,
  setWindowButtonsHidden,
} from "./main-window";
import setVibrancy from "./commands/set-vibrancy";
import { execPath, modelsPath } from "./utils/get-resource-paths";
import batchUpscayl from "./commands/batch-upscayl";
import doubleUpscayl from "./commands/double-upscayl";
import autoUpdate from "./commands/auto-update";
import { FEATURE_FLAGS } from "../common/feature-flags";
import settings from "electron-settings";
import pasteImage, { cleanUpPastedImages } from "./commands/paste-image";
import getImagePaths from "./commands/get-image-paths";
import getDroppedPathType from "./commands/get-dropped-path-type";
import getFileSize from "./commands/get-file-size";
import { registerProtocols } from "./utils/protocols";
import { getDeviceSpecs } from "./utils/get-device-specs";
import removeBackground, {
  exportRemoveBackground,
  stopRemoveBackground,
} from "./commands/remove-background";

// INITIALIZATION
log.initialize({ preload: true });

// Pasted pictures are kept in the temp folder and removed when the app quits.
app.on("before-quit", cleanUpPastedImages);

// There is no <webview> in the app, so none may be attached.
app.on("web-contents-created", (_event, contents) => {
  contents.on("will-attach-webview", (event) => event.preventDefault());
});

app.whenReady().then(async () => {
  registerProtocols();
  restrictPagePermissions();
  logit("🚃 App Path: ", app.getAppPath());

  createMainWindow();

  log.info(
    "🆙 Upscayl version:",
    app.getVersion(),
    FEATURE_FLAGS.APP_STORE_BUILD ? "MAC-APP-STORE" : "FOSS",
  );
  log.info("🚀 UPSCAYL EXEC PATH: ", execPath);
  log.info("🚀 MODELS PATH: ", modelsPath);

  let closeAccess;
  const folderBookmarks = await settings.get("folder-bookmarks");
  if (FEATURE_FLAGS.APP_STORE_BUILD && folderBookmarks) {
    logit("🚨 Folder Bookmarks: ", folderBookmarks);
    try {
      closeAccess = app.startAccessingSecurityScopedResource(
        folderBookmarks as string,
      );
    } catch (error) {
      logit("📁 Folder Bookmarks Error: ", error);
    }
  }
});

// Quit the app once all windows are closed
app.on("window-all-closed", () => {
  app.quit();
});

// ! ENABLE THIS FOR MACOS APP STORE BUILD
if (FEATURE_FLAGS.APP_STORE_BUILD) {
  logit("🚀 APP STORE BUILD ENABLED");
  app.commandLine.appendSwitch("in-process-gpu");
}

ipcMain.on(ELECTRON_COMMANDS.STOP, stop);

ipcMain.on(ELECTRON_COMMANDS.OPEN_FOLDER, openFolder);

ipcMain.handle(ELECTRON_COMMANDS.SELECT_FOLDER, selectFolder);

ipcMain.handle(ELECTRON_COMMANDS.SELECT_FILE, selectFile);

ipcMain.handle(ELECTRON_COMMANDS.GET_DROPPED_PATH_TYPE, getDroppedPathType);

ipcMain.handle(ELECTRON_COMMANDS.GET_FILE_SIZE, getFileSize);

ipcMain.on(ELECTRON_COMMANDS.GET_MODELS_LIST, getModelsList);

ipcMain.handle(
  ELECTRON_COMMANDS.SELECT_CUSTOM_MODEL_FOLDER,
  customModelsSelect,
);

ipcMain.on(ELECTRON_COMMANDS.UPSCAYL, imageUpscayl);

ipcMain.on(ELECTRON_COMMANDS.FOLDER_UPSCAYL, batchUpscayl);

ipcMain.on(ELECTRON_COMMANDS.DOUBLE_UPSCAYL, doubleUpscayl);

ipcMain.on(ELECTRON_COMMANDS.PASTE_IMAGE, pasteImage);

ipcMain.on(ELECTRON_COMMANDS.REMOVE_BACKGROUND, removeBackground);

ipcMain.on(ELECTRON_COMMANDS.REMOVE_BACKGROUND_STOP, stopRemoveBackground);

ipcMain.handle(
  ELECTRON_COMMANDS.EXPORT_REMOVE_BACKGROUND,
  exportRemoveBackground,
);

ipcMain.on(ELECTRON_COMMANDS.ONBOARDING_COMPLETE, () => {
  setWindowButtonsHidden(false);
  getMainWindow()?.maximize();
});

ipcMain.on(ELECTRON_COMMANDS.QUIT_APP, () => {
  app.quit();
});

ipcMain.on(ELECTRON_COMMANDS.SET_VIBRANCY, setVibrancy);

ipcMain.on(ELECTRON_COMMANDS.GET_IMAGE_PATHS, getImagePaths);

// The page is sandboxed and cannot read the system itself, so it asks for this.
ipcMain.handle("get-system-info", async () => {
  let gpuInfo: Parameters<typeof getDeviceSpecs>[0] = null;
  try {
    gpuInfo = (await app.getGPUInfo("complete")) as typeof gpuInfo;
  } catch (error) {
    console.error("Failed to get GPU info:", error);
  }
  return getDeviceSpecs(gpuInfo);
});

ipcMain.handle("get-app-version", () => {
  return `${app.getVersion()} ${
    FEATURE_FLAGS.APP_STORE_BUILD ? "MAC-APP-STORE" : "FOSS"
  }`;
});

if (!FEATURE_FLAGS.APP_STORE_BUILD) {
  autoUpdater.on("update-downloaded", autoUpdate);
}
