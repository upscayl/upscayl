import { IpcRenderer } from "electron";

export interface IElectronAPI {
  on: (command, func?) => IpcRenderer;
  off: (command, func?) => IpcRenderer;
  send: <T>(command, func?: T) => IpcRenderer;
  invoke: (command, func?) => any;
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
