/**
 * This file contains all the global local storage variables that need to be accessed on startup or during the app lifecycle. These are the variables that are not sent by the renderer process but are the localstorage variables used by the main process.
 * Our goal is to send as many variables as possible from the renderer process to the main process to avoid using local storage variables.
 */

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

/**
 * The saved custom models folder path so that we can load the list of custom models from that folder on startup.
 */
export let savedCustomModelsPath: string | undefined = undefined;
export function setSavedCustomModelsPath(value: string | undefined): void {
  savedCustomModelsPath = value;
  logit("📁 Updating Custom Models Folder Path: ", savedCustomModelsPath);
}

/**
 * The stopped variable to stop the batch upscayl process.
 */
export let stopped = false;

/**
 * The child processes array to store the spawned upscayl processes.
 */
export let childProcesses: {
  process: ChildProcessWithoutNullStreams;
  kill: () => boolean;
}[] = [];

/**
 * The turn off notifications variable, so that we can load this value on startup.
 */
export let turnOffNotifications: boolean = false;
export function setTurnOffNotifications(value: boolean): void {
  turnOffNotifications = value;
  logit("🔕 Updating Turn Off Notifications: ", turnOffNotifications);
}

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

  // GET TURN OFF NOTIFICATIONS (BOOLEAN) FROM LOCAL STORAGE
  mainWindow.webContents
    .executeJavaScript('localStorage.getItem("turnOffNotifications");', true)
    .then((lastSaved: string | null) => {
      if (lastSaved !== null) {
        setTurnOffNotifications(lastSaved === "true");
      }
    });
}
