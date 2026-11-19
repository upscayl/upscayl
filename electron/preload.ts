import { ipcRenderer, contextBridge } from "electron";
import {
  getAppVersion,
  getDeviceSpecs,
  getPlatform,
} from "./utils/get-device-specs";

// 'ipcRenderer' will be available in index.js with the method 'window.electron'
contextBridge.exposeInMainWorld("electron", {
  send: (command: string, payload: any) => ipcRenderer.send(command, payload),
  on: (command: string, func: (...args: any) => any) => {
    const subscription = (event: any, ...args: any[]) => func(event, ...args);
    ipcRenderer.on(command, subscription);
    return () => {
      ipcRenderer.removeListener(command, subscription);
    };
  },
  off: (command: string, func: (...args: any) => any) =>
    ipcRenderer.removeListener(command, func),
  invoke: (command: string, payload: any) =>
    ipcRenderer.invoke(command, payload),
  platform: getPlatform(),
  getSystemInfo: async () => await getDeviceSpecs(),
  getAppVersion: async () => await getAppVersion(),
});
