const { ipcRenderer, contextBridge } = require("electron");

// 'ipcRenderer' will be available in index.js with the method 'window.electron'
contextBridge.exposeInMainWorld("electron", {
  send: (command, payload) => ipcRenderer.send(command, payload),
  on: (command, func) =>
    ipcRenderer.on(command, (event, args) => {
      func(event, args);
    }),
});
