import { ipcRenderer } from "electron";
declare global {
  interface Window {
    /** APIs for Electron IPC */
    ipcRenderer?: typeof ipcRenderer;
  }
}

// Makes TS sees this as an external modules so we can extend the global scope.
export {};
