import { IpcRenderer } from "electron";

export interface IElectronAPI {
  on: (command, func?) => IpcRenderer;
  send: (command, func?) => IpcRenderer;
  invoke: (command, func?) => any;
}

declare global {
  interface Window {
    electron: IElectronAPI;
  }
}
