const { ipcRenderer, contextBridge } = require("electron");

// 'ipcRenderer' will be available in index.js with the method 'window.electron'
contextBridge.exposeInMainWorld("electron", ipcRenderer);
