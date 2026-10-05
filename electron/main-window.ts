import { app, BrowserWindow, nativeTheme, shell } from "electron";
import { getPlatform } from "./utils/get-device-specs";
import { join } from "path";
import { ELECTRON_COMMANDS } from "../common/electron-commands";
import { fetchLocalStorage } from "./utils/config-variables";
import { autoUpdater } from "electron-updater";
import settings from "electron-settings";

let mainWindow: BrowserWindow | undefined;
let windowButtonsHidden = false;

// macOS can't change a window's transparency after creation, so remember the choice for next launch.
const isVibrant = () =>
  process.platform === "darwin" && settings.getSync("vibrancy") !== false;

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

  const vibrant = isVibrant();
  if (vibrant) nativeTheme.themeSource = "dark";

  mainWindow = new BrowserWindow({
    icon: getWindowIcon(),
    width: 960,
    height: 720,
    minHeight: 640,
    minWidth: 760,
    center: true,
    show: false,
    backgroundColor: vibrant ? "#00000000" : "#171717",
    vibrancy: vibrant ? "under-window" : undefined,
    hasShadow: !vibrant,
    visualEffectState: "active",
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
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  nativeTheme.on("updated", () => setWindowButtonsHidden());

  mainWindow.once("ready-to-show", async () => {
    if (!mainWindow) return;

    const showOnboarding = await mainWindow.webContents.executeJavaScript(
      'localStorage.getItem("showOnboarding") !== "false";',
      true,
    );

    if (!showOnboarding) {
      mainWindow.maximize();
    } else {
      setWindowButtonsHidden(true);
    }

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

// macOS can bring the traffic lights back when the title bar re-lays out
// (vibrancy, appearance changes), so call this without an argument to re-apply.
const setWindowButtonsHidden = (hidden = windowButtonsHidden) => {
  windowButtonsHidden = hidden;
  if (process.platform === "darwin") {
    mainWindow?.setWindowButtonVisibility(!hidden);
  }
};

export { createMainWindow, getMainWindow, isVibrant, setWindowButtonsHidden };
