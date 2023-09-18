import { BrowserWindow, shell } from "electron";
import { getPlatform } from "./utils/get-device-specs";
import { join } from "path";
import COMMAND from "./constants/commands";
import {
  overwrite,
  setCustomModelsFolderPath,
  setFolderPath,
  setImagePath,
  setOutputFolderPath,
  setOverwrite,
  setCompression,
  setSaveOutputFolder,
} from "./utils/config-variables";
import electronIsDev from "electron-is-dev";
import { format } from "url";

let mainWindow: BrowserWindow | undefined;

const createMainWindow = () => {
  mainWindow = new BrowserWindow({
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

  const url = electronIsDev
    ? "http://localhost:8000"
    : format({
        pathname: join(__dirname, "../renderer/out/index.html"),
        protocol: "file:",
        slashes: true,
      });

  mainWindow.loadURL(url);

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.once("ready-to-show", () => {
    if (!mainWindow) return;
    mainWindow.show();
  });

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
  // GET IMAGE COMPRESSION (NUMBER) FROM LOCAL STORAGE
  mainWindow.webContents
    .executeJavaScript('localStorage.getItem("compression");', true)
    .then((lastSavedCompression: string | null) => {
      if (lastSavedCompression !== null) {
        setCompression(parseInt(lastSavedCompression));
      }
    });
  // GET OVERWRITE (BOOLEAN) FROM LOCAL STORAGE
  mainWindow.webContents
    .executeJavaScript('localStorage.getItem("overwrite");', true)
    .then((lastSavedOverwrite: string | null) => {
      if (lastSavedOverwrite !== null) {
        setOverwrite(lastSavedOverwrite === "true");
      }
    });

  mainWindow.webContents.send(COMMAND.OS, getPlatform());

  mainWindow.setMenuBarVisibility(false);
};

const getMainWindow = () => {
  return mainWindow;
};

export { createMainWindow, getMainWindow };
