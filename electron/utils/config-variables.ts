import { ChildProcessWithoutNullStreams } from "child_process";
import { getMainWindow } from "../main-window";
import logit from "./logit";

/**
 * The saved image path so that the select image dialog can open to the last used path.
 */
export let savedImagePath: string | undefined = "";
export function setSavedImagePath(value: string | undefined): void {
  savedImagePath = value;
  logit("🖼️ Updating Image Path: ", savedImagePath);
}

/**
 * The saved folder path so that the select folder to upscayl dialog can open to the last used path.
 */
export let savedBatchUpscaylFolderPath: string | undefined = undefined;
export function setSavedBatchUpscaylFolderPath(
  value: string | undefined,
): void {
  savedBatchUpscaylFolderPath = value;
  logit("📁 Updating Folder Path: ", savedBatchUpscaylFolderPath);
}

export let savedCustomModelsPath: string | undefined = undefined;
export function setSavedCustomModelsPath(value: string | undefined): void {
  savedCustomModelsPath = value;
  logit("📁 Updating Custom Models Folder Path: ", savedCustomModelsPath);
}

export let savedOutputPath: string | undefined = undefined;
export function setSavedOutputPath(value: string | undefined): void {
  savedOutputPath = value;
  logit("📁 Updating Output Folder Path: ", savedOutputPath);
}

export let rememberOutputFolder = false;
export function setRememberOutputFolder(value: boolean): void {
  rememberOutputFolder = value;
  logit("💾 Updating Remember Output Folder: ", rememberOutputFolder);
}

export let stopped = false;
export let childProcesses: {
  process: ChildProcessWithoutNullStreams;
  kill: () => boolean;
}[] = [];

export let noImageProcessing: boolean = false;
export function setNoImageProcessing(value: boolean): void {
  noImageProcessing = value;
  logit("🖼️ Updating No Image Processing: ", noImageProcessing);
}

export let turnOffNotifications: boolean = false;
export function setTurnOffNotifications(value: boolean): void {
  turnOffNotifications = value;
  logit("🔕 Updating Turn Off Notifications: ", turnOffNotifications);
}

// export let customWidth: string | null = null;
// export function setCustomWidth(value: string | null): void {
//   customWidth = value;
//   logit("📏 Updating Custom Width: ", customWidth);
// }

// export let useCustomWidth: boolean = false;
// export function setUseCustomWidth(value: boolean): void {
//   useCustomWidth = value;
//   logit("📏 Updating Use Custom Width: ", useCustomWidth);
// }

// SETTERS

export function setStopped(value: boolean): void {
  stopped = value;
  logit("🛑 Updating Stopped: ", stopped);
}

export function setChildProcesses(value: {
  process: ChildProcessWithoutNullStreams;
  kill: () => boolean;
}): void {
  childProcesses.push(value);
  logit(
    "👶 Updating Child Processes: ",
    JSON.stringify({
      binary: childProcesses[0].process.spawnfile,
      args: childProcesses[0].process.spawnargs,
    }),
  );
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
        setSavedImagePath(lastImagePath);
      }
    });
  // GET LAST FOLDER PATH TO LOCAL STORAGE
  mainWindow.webContents
    .executeJavaScript(
      'localStorage.getItem("lastSavedBatchUpscaylFolderPath");',
      true,
    )
    .then((lastSavedBatchUpscaylFolderPath: string | null) => {
      if (
        lastSavedBatchUpscaylFolderPath &&
        lastSavedBatchUpscaylFolderPath.length > 0
      ) {
        setSavedBatchUpscaylFolderPath(lastSavedBatchUpscaylFolderPath);
      }
    });
  // GET LAST CUSTOM MODELS FOLDER PATH TO LOCAL STORAGE
  mainWindow.webContents
    .executeJavaScript('localStorage.getItem("customModelsFolderPath");', true)
    .then((value: string | null) => {
      if (value && value.length > 0) {
        setSavedCustomModelsPath(value);
      }
    });
  // GET LAST CUSTOM MODELS FOLDER PATH TO LOCAL STORAGE
  mainWindow.webContents
    .executeJavaScript('localStorage.getItem("savedOutputPath");', true)
    .then((savedOutputPath: string | null) => {
      if (savedOutputPath && savedOutputPath.length > 0) {
        setSavedOutputPath(savedOutputPath);
      }
    });
  // GET LAST SAVE OUTPUT FOLDER (BOOLEAN) TO LOCAL STORAGE
  mainWindow.webContents
    .executeJavaScript('localStorage.getItem("rememberOutputFolder");', true)
    .then((lastSaveOutputFolder: boolean | null) => {
      if (lastSaveOutputFolder !== null) {
        setRememberOutputFolder(lastSaveOutputFolder);
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

  // GET TURN OFF NOTIFICATIONS (BOOLEAN) FROM LOCAL STORAGE
  mainWindow.webContents
    .executeJavaScript('localStorage.getItem("turnOffNotifications");', true)
    .then((lastSaved: string | null) => {
      if (lastSaved !== null) {
        setTurnOffNotifications(lastSaved === "true");
      }
    });

  // // GET CUSTOM WIDTH (STRING) FROM LOCAL STORAGE
  // mainWindow.webContents
  //   .executeJavaScript('localStorage.getItem("customWidth");', true)
  //   .then((lastSaved: string | null) => {
  //     if (lastSaved !== null) {
  //       setCustomWidth(lastSaved);
  //     }
  //   });

  // // GET USE CUSTOM WIDTH (BOOLEAN) FROM LOCAL STORAGE
  // mainWindow.webContents
  //   .executeJavaScript('localStorage.getItem("useCustomWidth");', true)
  //   .then((lastSaved: string | null) => {
  //     if (lastSaved !== null) {
  //       setUseCustomWidth(lastSaved === "true");
  //     }
  //   });
}
