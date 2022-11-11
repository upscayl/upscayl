"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
// 'ipcRenderer' will be available in index.js with the method 'window.electron'
electron_1.contextBridge.exposeInMainWorld("electron", {
    send: (command, payload) => electron_1.ipcRenderer.send(command, payload),
    on: (command, func) => electron_1.ipcRenderer.on(command, (event, args) => {
        func(event, args);
    }),
    invoke: (command, payload) => electron_1.ipcRenderer.invoke(command, payload),
});
