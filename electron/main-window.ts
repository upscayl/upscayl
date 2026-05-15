import { app, BrowserWindow, shell } from "electron";
import { getPlatform } from "./utils/get-device-specs";
import { join } from "path";
import { ELECTRON_COMMANDS } from "../common/electron-commands";
import { fetchLocalStorage } from "./utils/config-variables";
import { autoUpdater } from "electron-updater";

let mainWindow: BrowserWindow | undefined;

const getRendererUrl = () => {
  return process.env.UPSCAYL_RENDERER_URL || process.env.ELECTRON_RENDERER_URL;
};

const getWindowIcon = () => {
  if (app.isPackaged) {
    return join(process.resourcesPath, "512x512.png");
  }

  return join(app.getAppPath(), "resources", "icons", "512x512.png");
};

const createMainWindow = () => {
  console.log("📂 DIRNAME", __dirname);
  console.log("🚃 App Path: ", app.getAppPath());

  mainWindow = new BrowserWindow({
    icon: getWindowIcon(),
    width: 1300,
    height: 940,
    minHeight: 500,
    minWidth: 600,
    show: false,
    backgroundColor: "#171717",
    webPreferences: {
      nodeIntegration: true,
      nodeIntegrationInWorker: true,
      webSecurity: false,
      preload: join(__dirname, "../preload/index.js"),
    },
    titleBarStyle: getPlatform() === "mac" ? "hiddenInset" : "default",
  });

  const rendererUrl = getRendererUrl();

  if (!app.isPackaged && rendererUrl) {
    mainWindow.loadURL(rendererUrl);
  } else {
    mainWindow.loadFile(join(__dirname, "../../renderer/out/index.html"));
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.once("ready-to-show", () => {
    if (!mainWindow) return;
    mainWindow.show();
  });

  fetchLocalStorage();

  if (app.isPackaged) {
    console.log("🚀 Checking for updates");
    mainWindow.webContents
      .executeJavaScript('localStorage.getItem("autoUpdate");', true)
      .then((lastSaved: string | null) => {
        if (
          lastSaved === null ||
          lastSaved === undefined ||
          lastSaved === "true"
        ) {
          autoUpdater.checkForUpdates();
        } else {
          console.log("🚀 Auto Update is disabled");
        }
      });
  }

  mainWindow.webContents.send(ELECTRON_COMMANDS.OS, getPlatform());

  mainWindow.setMenuBarVisibility(false);
};

const getMainWindow = () => {
  return mainWindow;
};

export { createMainWindow, getMainWindow };
