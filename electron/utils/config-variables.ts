import { ChildProcessWithoutNullStreams } from "child_process";
import { getMainWindow } from "../main-window";
import logit from "./logit";

export let imagePath: string | undefined = "";
export let folderPath: string | undefined = undefined;
export let customModelsFolderPath: string | undefined = undefined;
export let outputFolderPath: string | undefined = undefined;
export let saveOutputFolder = false;
export let compression = 0;
export let overwrite = false;
export let stopped = false;
export let childProcesses: {
  process: ChildProcessWithoutNullStreams;
  kill: () => boolean;
}[] = [];
export let noImageProcessing: boolean = false;

export function setImagePath(value: string | undefined): void {
  imagePath = value;
  logit("🖼️ Updating Image Path: ", imagePath);
}

export function setFolderPath(value: string | undefined): void {
  folderPath = value;
  logit("📁 Updating Folder Path: ", folderPath);
}

export function setCustomModelsFolderPath(value: string | undefined): void {
  customModelsFolderPath = value;
  logit("📁 Updating Custom Models Folder Path: ", customModelsFolderPath);
}

// SETTERS
export function setOutputFolderPath(value: string | undefined): void {
  outputFolderPath = value;
  logit("📁 Updating Output Folder Path: ", outputFolderPath);
}

export function setSaveOutputFolder(value: boolean): void {
  saveOutputFolder = value;
  logit("💾 Updating Save Output Folder: ", saveOutputFolder);
}

export function setCompression(value: number): void {
  compression = value;
  logit("📐 Updating Compression: ", compression);
}

export function setOverwrite(value: boolean): void {
  overwrite = value;
  logit("📝 Updating Overwrite: ", overwrite);
}

export function setStopped(value: boolean): void {
  stopped = value;
  logit("🛑 Updating Stopped: ", stopped);
}

export function setChildProcesses(value: {
  process: ChildProcessWithoutNullStreams;
  kill: () => boolean;
}): void {
  childProcesses.push(value);
  logit("👶 Updating Child Processes: ", childProcesses);
}

export function setNoImageProcessing(value: boolean): void {
  noImageProcessing = value;
  logit("🖼️ Updating No Image Processing: ", noImageProcessing);
}

// LOCAL STORAGE
export function fetchLocalStorage(): void {
  const mainWindow = getMainWindow();
  if (!mainWindow) return;

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
  // GET PROCESS IMAGE (BOOLEAN) FROM LOCAL STORAGE
  mainWindow.webContents
    .executeJavaScript('localStorage.getItem("noImageProcessing");', true)
    .then((lastSaved: string | null) => {
      if (lastSaved !== null) {
        setNoImageProcessing(lastSaved === "true");
      }
    });
}
