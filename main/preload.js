const { ipcRenderer, contextBridge } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  message: (data) => ipcRenderer.send("message", data),
});
