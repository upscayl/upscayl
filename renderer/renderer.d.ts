import { IpcRenderer } from "electron";

export interface IElectronAPI {
  on: (command, func?) => IpcRenderer;
  send: <T>(command, func?: T) => IpcRenderer;
  invoke: (command, func?) => any;
  platform: "mac" | "win" | "linux";
}

declare global {
  interface Window {
    electron: IElectronAPI;
  }
}
