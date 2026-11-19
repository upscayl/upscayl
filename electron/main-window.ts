import { app, BrowserWindow, nativeTheme, session, shell } from "electron";
import { getPlatform } from "./utils/get-device-specs";
import { join } from "path";
import { pathToFileURL } from "url";
import { ELECTRON_COMMANDS } from "../common/electron-commands";
import { fetchLocalStorage } from "./utils/config-variables";
import { autoUpdater } from "electron-updater";
import settings from "electron-settings";

let mainWindow: BrowserWindow | undefined;
let windowButtonsHidden = false;

const isWebUrl = (target: string) => /^https?:\/\//i.test(target);
const withoutQuery = (target: string) => target.split(/[?#]/)[0];

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
      nodeIntegration: false,
      nodeIntegrationInWorker: false,
      contextIsolation: true,
      // the preload loads Node modules (os and the like), so it can't run in the sandbox
      sandbox: false,
      webSecurity: true,
      preload: join(__dirname, "../preload/index.js"),
    },
    titleBarStyle: getPlatform() === "mac" ? "hiddenInset" : "default",
  });

  const rendererUrl = !app.isPackaged ? getRendererUrl() : undefined;
  const rendererFile = join(__dirname, "../renderer/index.html");

  if (rendererUrl) {
    mainWindow.loadURL(rendererUrl);
  } else {
    mainWindow.loadFile(rendererFile);
  }

  // The window shows the app and nothing else. A link or a redirect to any other page opens in the user's
  // browser and never loads here, because this window has the IPC bridge.
  const isAppPage = (target: string) => {
    try {
      return rendererUrl
        ? new URL(target).origin === new URL(rendererUrl).origin
        : withoutQuery(target) === pathToFileURL(rendererFile).toString();
    } catch {
      return false;
    }
  };
  const guardNavigation = (
    event: { preventDefault: () => void },
    target: string,
  ) => {
    if (isAppPage(target)) return;
    event.preventDefault();
    if (isWebUrl(target)) shell.openExternal(target);
  };
  mainWindow.webContents.on("will-navigate", guardNavigation);
  mainWindow.webContents.on("will-redirect", guardNavigation);
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (isWebUrl(url) || url.startsWith("mailto:")) shell.openExternal(url);
    return { action: "deny" };
  });

  // No camera, location and the like for the page. Copying text out of it still works.
  const isAllowed = (permission: string) =>
    permission === "clipboard-sanitized-write";
  session.defaultSession.setPermissionRequestHandler(
    (_webContents, permission, callback) => callback(isAllowed(permission)),
  );
  session.defaultSession.setPermissionCheckHandler((_webContents, permission) =>
    isAllowed(permission),
  );

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
