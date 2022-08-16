// Native
const { join } = require("path");
const { format } = require("url");
const { spawn } = require("child_process");
const fs = require("fs");

const { execPath, modelsPath } = require("./binaries");

// Packages
const { BrowserWindow, app, ipcMain, dialog } = require("electron");
const isDev = require("electron-is-dev");
const prepareNext = require("electron-next");

// Prepare the renderer once the app is ready
app.on("ready", async () => {
  await prepareNext("./renderer");

  const mainWindow = new BrowserWindow({
    width: 1100,
    height: 700,
    webPreferences: {
      autoHideMenuBar: true,
      nodeIntegration: true,
      preload: join(__dirname, "preload.js"),
    },
  });
  const url = isDev
    ? "http://localhost:8000"
    : format({
        pathname: join(__dirname, "../renderer/out/index.html"),
        protocol: "file:",
        slashes: true,
      });

  mainWindow.setMenuBarVisibility(false);
  mainWindow.maximize();
  mainWindow.loadURL(url);
});

// Quit the app once all windows are closed
app.on("window-all-closed", app.quit);

// ! DONT FORGET TO RESTART THE APP WHEN YOU CHANGE CODE HERE
ipcMain.on("sendMessage", (_, message) => {
  console.log(message);
});

ipcMain.handle("open", async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ["openFile", "multiSelections"],
  });

  if (canceled) {
    console.log("operation cancelled");
    return "cancelled";
  } else {
    console.log(filePaths[0]);
    // CREATE input AND upscaled FOLDER
    let inputDir = "./input";
    if (!fs.existsSync(inputDir)) {
      fs.mkdirSync(inputDir);
    }
    let outputDir = "./upscaled";
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    // COPY IMAGE TO upscaled FOLDER
    const fileName = filePaths[0].split("/").slice(-1)[0];
    console.log("🚀 => ipcMain.handle => fileName", fileName);
    fs.copyFile(filePaths[0], inputDir + "/" + fileName, (err) => {
      if (err) throw err;
      console.log("File Copy Successfully.");
    });

    // UPSCALE
    console.log(execPath);
    console.log(modelsPath);
    let command = spawn(execPath, [
      "-i",
      inputDir,
      "-o",
      outputDir,
      "-s",
      4,
      "-m",
      modelsPath,
    ]);
    command.stdout.on("data", (data) => {
      console.log("stdout: ", data.toString());
    });
    command.on("error", (error) => {
      console.log(error);
    });
    command.on("exit", (code, signal) => {
      console.log("Exit: ", code, signal);
    });

    return filePaths[0];
  }
});
