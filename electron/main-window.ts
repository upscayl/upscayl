import { BrowserWindow, shell } from "electron";
import { getPlatform } from "./get-device-specs";
import { join } from "path";
import {
  setCustomModelsFolderPath,
  setFolderPath,
  setImagePath,
  setOutputFolderPath,
  setOverwrite,
  setQuality,
  setSaveOutputFolder,
} from "./utils/config-variables";
import COMMAND from "./constants/commands";
import electronIsDev from "electron-is-dev";

let mainWindow: BrowserWindow | null;

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

  mainWindow.setMenuBarVisibility(false);

  const url = electronIsDev
    ? "http://localhost:8000"
    : (new URL("file:///").pathname = join(
        __dirname,
        "../renderer/out/index.html"
      )).toString();
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
  // GET IMAGE QUALITY (NUMBER) TO LOCAL STORAGE
  mainWindow.webContents
    .executeJavaScript('localStorage.getItem("overwrite");', true)
    .then((lastSavedOverwrite: string | null) => {
      if (lastSavedOverwrite !== null) {
        setOverwrite(lastSavedOverwrite === "true");
      }
    });
  mainWindow.webContents.send(COMMAND.OS, getPlatform());
};

const getMainWindow = () => {
  return mainWindow;
};

export { createMainWindow, getMainWindow };
