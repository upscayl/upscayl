import { contextBridge } from "electron";
import { ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("ipcRenderer", ipcRenderer);
