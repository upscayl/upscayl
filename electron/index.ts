import prepareNext from "electron-next";
import { autoUpdater } from "electron-updater";
import log from "electron-log";
import { app, ipcMain, protocol } from "electron";
import { ELECTRON_COMMANDS } from "../common/electron-commands";
import logit from "./utils/logit";
import openFolder from "./commands/open-folder";
import stop from "./commands/stop";
import selectFolder from "./commands/select-folder";
import selectFile from "./commands/select-file";
import getModelsList from "./commands/get-models-list";
import customModelsSelect from "./commands/custom-models-select";
import imageUpscayl from "./commands/image-upscayl";
import { createMainWindow } from "./main-window";
import electronIsDev from "electron-is-dev";
import { execPath, modelsPath } from "./utils/get-resource-paths";
import batchUpscayl from "./commands/batch-upscayl";
import doubleUpscayl from "./commands/double-upscayl";
import autoUpdate from "./commands/auto-update";
import { FEATURE_FLAGS } from "../common/feature-flags";
import settings from "electron-settings";
import pasteImage from "./commands/paste-image";
import path from "path";
import getNestedFoldersWithRespectToDepth from "./commands/get-nested-folders";

// INITIALIZATION
log.initialize({ preload: true });

app.on("ready", async () => {
  await prepareNext("./renderer");

  app.whenReady().then(() => {
    protocol.registerFileProtocol("file", (request, callback) => {
      const pathname = decodeURI(request.url.replace("file:///", ""));
      callback(pathname);
    });
    protocol.registerFileProtocol("public", (request, callback) => {
      const filePath = decodeURI(request.url.replace("public:///", ""));
      const asarPath = path.join(
        app.getAppPath(),
        "renderer",
        process.env.NODE_ENV === "development" ? "public" : "out",
        filePath,
      );
      callback(asarPath);
    });
    logit("🚃 App Path: ", app.getAppPath());
  });

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

ipcMain.on(ELECTRON_COMMANDS.GET_MODELS_LIST, getModelsList);

ipcMain.handle(
  ELECTRON_COMMANDS.SELECT_CUSTOM_MODEL_FOLDER,
  customModelsSelect,
);
ipcMain.handle(
  ELECTRON_COMMANDS.SELECT_NESTED_FOLDERS,
  getNestedFoldersWithRespectToDepth
);

ipcMain.on(ELECTRON_COMMANDS.UPSCAYL, imageUpscayl);

ipcMain.on(ELECTRON_COMMANDS.FOLDER_UPSCAYL, batchUpscayl);

ipcMain.on(ELECTRON_COMMANDS.DOUBLE_UPSCAYL, doubleUpscayl);

ipcMain.on(ELECTRON_COMMANDS.PASTE_IMAGE, pasteImage);

ipcMain.handle("get-gpu-info", async () => {
  try {
    return await app.getGPUInfo("complete");
  } catch (error) {
    console.error("Failed to get GPU info:", error);
    return null;
  }
});

ipcMain.handle("get-app-version", () => {
  return `${app.getVersion()} ${
    FEATURE_FLAGS.APP_STORE_BUILD ? "MAC-APP-STORE" : "FOSS"
  }`;
});

if (!FEATURE_FLAGS.APP_STORE_BUILD) {
  autoUpdater.on("update-downloaded", autoUpdate);
}
