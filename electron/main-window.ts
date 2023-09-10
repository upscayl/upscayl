import prepareNext from "electron-next";
import { BrowserWindow, app, net, protocol, shell } from "electron";
import COMMAND from "./constants/commands";
import { getPlatform } from "./get-device-specs";
import { join } from "path";
import { execPath, modelsPath } from "./binaries";
import log from "electron-log";
import isDev from "electron-is-dev";
import { autoUpdater } from "electron-updater";
import {
  setCustomModelsFolderPath,
  setFolderPath,
  setImagePath,
  setOutputFolderPath,
  setQuality,
  setSaveOutputFolder,
} from "./utils/config-variables";

// Prepare the renderer once the app is ready
let _mainWindow: BrowserWindow | null = null;

const getMainWindow = () => {
  if (!_mainWindow) {
    _mainWindow = new BrowserWindow({
      icon: join(__dirname, "build", "icon.png"),
      width: 1300,
      height: 940,
      minHeight: 500,
      minWidth: 500,
      show: false,
      backgroundColor: "#171717",
      webPreferences: {
        nodeIntegration: true,
        nodeIntegrationInWorker: true,
        webSecurity: false,
        preload: join(__dirname, "preload.js"),
      },
      titleBarStyle: getPlatform() === "mac" ? "hiddenInset" : "default",
    });
  }

  return _mainWindow;
};

const mainWindow = getMainWindow();

app.on("ready", async () => {
  await prepareNext("./renderer");

  log.info("🚀 UPSCAYL EXEC PATH: ", execPath("realesrgan"));
  log.info("🚀 MODELS PATH: ", modelsPath);

  const url = isDev
    ? "http://localhost:8000"
    : (new URL("file:///").pathname = join(
        __dirname,
        "../renderer/out/index.html"
      )).toString();

  mainWindow.setMenuBarVisibility(false);
  mainWindow.loadURL(url);

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.once("ready-to-show", () => {
    if (!mainWindow) return;
    mainWindow.show();
    mainWindow.webContents.setZoomFactor(1);
  });

  app.whenReady().then(() => {
    protocol.handle("file", (request) => {
      const pathname = decodeURI(request.url.replace("file:///", ""));
      return net.fetch(pathname);
    });
  });

  if (!isDev) {
    autoUpdater.checkForUpdates();
  }

  // <------------------------Save Last Paths----------------------------->
  // GET LAST IMAGE PATH TO LOCAL STORAGE
  mainWindow.webContents
    .executeJavaScript('localStorage.getItem("lastImagePath");', true)
    .then((lastImagePath: string | null) => {
      if (lastImagePath && lastImagePath.length > 0) {
        setImagePath(lastImagePath);
      }
    });
  // GET LAST FOLDER PATH TO LOCAL STORAGE
  mainWindow.webContents
    .executeJavaScript('localStorage.getItem("lastFolderPath");', true)
    .then((lastFolderPath: string | null) => {
      if (lastFolderPath && lastFolderPath.length > 0) {
        setFolderPath(lastFolderPath);
      }
    });
  // GET LAST CUSTOM MODELS FOLDER PATH TO LOCAL STORAGE
  mainWindow.webContents
    .executeJavaScript(
      'localStorage.getItem("lastCustomModelsFolderPath");',
      true
    )
    .then((lastCustomModelsFolderPath: string | null) => {
      if (lastCustomModelsFolderPath && lastCustomModelsFolderPath.length > 0) {
        setCustomModelsFolderPath(lastCustomModelsFolderPath);
      }
    });
  // GET LAST CUSTOM MODELS FOLDER PATH TO LOCAL STORAGE
  mainWindow.webContents
    .executeJavaScript('localStorage.getItem("lastOutputFolderPath");', true)
    .then((lastOutputFolderPath: string | null) => {
      if (lastOutputFolderPath && lastOutputFolderPath.length > 0) {
        setOutputFolderPath(lastOutputFolderPath);
      }
    });
  // GET LAST SAVE OUTPUT FOLDER (BOOLEAN) TO LOCAL STORAGE
  mainWindow.webContents
    .executeJavaScript('localStorage.getItem("rememberOutputFolder");', true)
    .then((lastSaveOutputFolder: boolean | null) => {
      if (lastSaveOutputFolder !== null) {
        setSaveOutputFolder(lastSaveOutputFolder);
      }
    });
  // GET IMAGE QUALITY (NUMBER) TO LOCAL STORAGE
  mainWindow.webContents
    .executeJavaScript('localStorage.getItem("quality");', true)
    .then((lastSavedQuality: string | null) => {
      if (lastSavedQuality !== null) {
        if (parseInt(lastSavedQuality) === 100) {
          setQuality(99);
        } else {
          setQuality(parseInt(lastSavedQuality));
        }
      }
    });
  mainWindow.webContents.send(COMMAND.OS, getPlatform());
});

export default mainWindow;
