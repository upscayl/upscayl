import { IpcRenderer } from "electron";

export interface IElectronAPI {
  /** Returns a function that removes the listener again. */
  on: (command, func?) => () => void;
  off: (command, func?) => void;
  send: <T>(command, func?: T) => IpcRenderer;
  invoke: (command, func?) => any;
  getPathForFile: (file: File) => string;
  platform: "mac" | "win" | "linux";
  getSystemInfo: () => Promise<{
    platform: string | undefined;
    release: string;
    arch: string | undefined;
    model: string;
    cpuCount: number;
    gpu: Record<string, any>;
  }>;
  getAppVersion: () => Promise<string>;
}

declare global {
  interface Window {
    electron: IElectronAPI;
  }
}
