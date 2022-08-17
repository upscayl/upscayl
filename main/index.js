// Native
const { join } = require("path");
const { format } = require("url");
const { spawn } = require("child_process");
const fs = require("fs");

const { execPath, modelsPath } = require("./binaries");

// Packages
const {
  BrowserWindow,
  app,
  ipcMain,
  dialog,
  ipcRenderer,
} = require("electron");
const isDev = require("electron-is-dev");
const prepareNext = require("electron-next");

// Prepare the renderer once the app is ready
let mainWindow;
app.on("ready", async () => {
  await prepareNext("./renderer");

  mainWindow = new BrowserWindow({
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
  // mainWindow.maximize();
  mainWindow.loadURL(url);
});

// Quit the app once all windows are closed
app.on("window-all-closed", app.quit);

// ! DONT FORGET TO RESTART THE APP WHEN YOU CHANGE CODE HERE
ipcMain.on("sendMessage", (_, message) => {
  console.log(message);
});

ipcMain.on("open", async () => {
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
    fs.copyFile(filePaths[0], inputDir + "/" + fileName, (err) => {
      if (err) throw err;
    });

    // UPSCALE
    let upscayl = spawn(
      execPath,
      [
        "-i",
        inputDir,
        "-o",
        outputDir,
        "-s",
        "4",
        "-m",
        modelsPath,
        "-n",
        "realesrgan-x4plus",
      ],
      {
        cwd: null,
        detached: false,
      }
    );

    upscayl.stderr.on("data", (stderr) => {
      console.log(stderr.toString());
      stderr = stderr.toString();
      mainWindow.webContents.send("output", stderr.toString());
    });

    upscayl.on("close", (code) => {
      console.log("Done upscaling", code);
      mainWindow.webContents.send("done");
    });

    return filePaths[0];
  }
});
