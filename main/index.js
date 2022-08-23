// Native
const { join, parse } = require("path");
const { format } = require("url");
const { spawn } = require("child_process");
const fs = require("fs");
const sizeOf = require("image-size");
const { autoUpdater } = require("electron-updater");

const { execPath, modelsPath } = require("./binaries");

// Packages
const {
  BrowserWindow,
  app,
  ipcMain,
  dialog,
  ipcRenderer,
  shell,
} = require("electron");
const isDev = require("electron-is-dev");
const prepareNext = require("electron-next");
const commands = require("./commands");
const sharp = require("sharp");

// Prepare the renderer once the app is ready
let mainWindow;
app.on("ready", async () => {
  await prepareNext("./renderer");

  mainWindow = new BrowserWindow({
    width: 1100,
    height: 850,
    minHeight: 500,
    minWidth: 500,
    webPreferences: {
      devTools: isDev,
      autoHideMenuBar: true,
      nodeIntegration: true,
      webSecurity: false,
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

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  if (!isDev) {
    autoUpdater.checkForUpdates();
  }
});

// Quit the app once all windows are closed
app.on("window-all-closed", app.quit);

// ! DONT FORGET TO RESTART THE APP WHEN YOU CHANGE CODE HERE

ipcMain.handle(commands.SELECT_FILE, async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ["openFile", "multiSelections"],
  });

  if (canceled) {
    console.log("operation cancelled");
    return "cancelled";
  } else {
    console.log(filePaths[0]);
    // CREATE input AND upscaled FOLDER
    return filePaths[0];
  }
});

ipcMain.handle(commands.SELECT_FOLDER, async (event, message) => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });
  if (canceled) {
    console.log("operation cancelled");
    return "cancelled";
  } else {
    console.log(filePaths[0]);
    return filePaths[0];
  }
});

ipcMain.on(commands.UPSCAYL, async (event, payload) => {
  //console.log(execPath)
  console.log(payload);
  const model = payload.model;
  const scale = payload.scaleFactor;
  let inputDir = payload.imagePath.match(/(.*)[\/\\]/)[1] || "";
  /*if (!fs.existsSync(inputDir)) {
    fs.mkdirSync(inputDir);
  }*/
  let outputDir = payload.outputPath;

  // if (!fs.existsSync(outputDir)) {
  //   fs.mkdirSync(outputDir);
  // }

  // COPY IMAGE TO upscaled FOLDER
  const fullfileName = payload.imagePath.split("/").slice(-1)[0];
  const fileName = parse(fullfileName).name;
  const fileExt = parse(fullfileName).ext;

  // UPSCALE
  let upscayl = spawn(
    execPath,
    [
      "-i",
      inputDir + "/" + fullfileName,
      "-o",
      outputDir + "/" + fileName + "_upscayled_" + scale + "x" + fileExt,
      "-s",
      scale === 2 ? 4 : scale,
      "-m",
      modelsPath, // if (!fs.existsSync(outputDir)) {
      //   fs.mkdirSync(outputDir);
      // }
      "-n",
      model,
    ],
    {
      cwd: null,
      detached: false,
    }
  );

  upscayl.stderr.on("data", (stderr) => {
    console.log(stderr.toString());
    stderr = stderr.toString();
    mainWindow.webContents.send(commands.UPSCAYL_PROGRESS, stderr.toString());
  });

  upscayl.on("close", (code) => {
    console.log("Done upscaling");
    mainWindow.webContents.send(
      commands.UPSCAYL_DONE,
      outputDir + "/" + fileName + "_upscayled_" + scale + "x" + fileExt
    );
  });
});

autoUpdater.on("update-available", (_event, releaseNotes, releaseName) => {
  const dialogOpts = {
    type: "info",
    buttons: ["Ok"],
    title: "Application Update",
    message: process.platform === "win32" ? releaseNotes : releaseName,
    detail: "A new version is being downloaded.",
  };
  dialog.showMessageBox(dialogOpts, (response) => {});
});

autoUpdater.on("update-downloaded", (_event, releaseNotes, releaseName) => {
  const dialogOpts = {
    type: "info",
    buttons: ["Restart", "Later"],
    title: "Application Update",
    message: process.platform === "win32" ? releaseNotes : releaseName,
    detail:
      "A new version has been downloaded. Restart the application to apply the updates.",
  };
  dialog.showMessageBox(dialogOpts).then((returnValue) => {
    if (returnValue.response === 0) autoUpdater.quitAndInstall();
  });
});
