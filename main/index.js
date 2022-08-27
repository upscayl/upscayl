// Native
const { join, parse } = require("path");
const { format } = require("url");
const { spawn } = require("child_process");
const fs = require("fs");
const sizeOf = require("image-size");
const path = require('path');
const { autoUpdater } = require("electron-updater");
const { getPlatform } = require("./getPlatform");

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
const tmpPath = path.join(app.getPath("userData"), "\\tmp\\");

// Prepare the renderer once the app is ready
let mainWindow;
app.on("ready", async () => {
  await prepareNext("./renderer");

  console.log("ICON: ", join(__dirname, "icon.png"));
  mainWindow = new BrowserWindow({
    icon: join(__dirname, "build", "icon.png"),
    width: 1100,
    height: 700,
    minHeight: 500,
    minWidth: 500,
    backgroundColor: "#171717",
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

// Fix file:// + ? by registering a new protocol
app.whenReady().then(() => {
  const { protocol } = require("electron");
  protocol.registerFileProtocol('local', (request, callback) => {
    const pathname = decodeURIComponent(request.url.replace('local://', ''));
    const parts = pathname.split('?');
    callback(parts[0]);
  });
});

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
    // CREATE original copy
    if(!fs.existsSync(tmpPath)) {
      fs.mkdirSync(tmpPath);
    }
    fs.copyFileSync(filePaths[0], path.join(tmpPath, "original" + parse(filePaths[0]).ext));
    return filePaths[0];
  }
});

ipcMain.handle(commands.SET_FILE, async (event, payload) => {
  const original = payload.original;
  const fileExt = parse(original).ext;
  // CREATE original copy
  if(!fs.existsSync(tmpPath)) {
    fs.mkdirSync(tmpPath);
  }
  fs.copyFileSync(original, path.join(tmpPath, "original" + fileExt));

})

ipcMain.handle(commands.SELECT_OUTPUT, async (event, payload) => {
  const original = payload.original;
  const fileExt = parse(original).ext;
  const { canceled, filePath } = await dialog.showSaveDialog({
    filters: [{name: fileExt, extensions: [fileExt.substring(1)]}]
  });
  if (canceled) {
    console.log("operation cancelled");
    return "cancelled";
  } else {
    console.log(filePath);
    if(fs.existsSync(tmpPath + "scaled" + fileExt)) {
      fs.copyFileSync(tmpPath + "scaled" + fileExt, filePath);
    }
    return filePath;
  }
});

ipcMain.handle(commands.REPLACE_ORIGINAL, async (event, payload) => {
  const original = payload.original;
  const fileExt = parse(original).ext;
  if(fs.existsSync(tmpPath + "scaled" + fileExt)) {
    fs.copyFileSync(tmpPath + "scaled" + fileExt, original);
  }
});

ipcMain.on(commands.UPSCAYL, async (event, payload) => {
  const model = payload.model;
  const scale = payload.scaleFactor;

  let inputDir = payload.imagePath.match(/(.*)[\/\\]/)[1] || "";
  let outputDir = tmpPath
  console.log("🚀 => ipcMain.on => outputDir", outputDir);

  // COPY IMAGE TO TMP FOLDER
  const platform = getPlatform();
  const fullfileName =
    platform === "win"
      ? payload.imagePath.split("\\").slice(-1)[0]
      : payload.imagePath.split("/").slice(-1)[0];
  const fileName = parse(fullfileName).name;
  const fileExt = parse(fullfileName).ext;

  // UPSCALE
  console.log("PRODUCTION? :", isDev);
  console.log("EXEC: ", execPath);
  let upscayl = spawn(
    execPath,
    [
      "-i",
      tmpPath + "original" + fileExt,
      "-o",
      tmpPath + "scaled" + fileExt,
      "-s",
      scale === 2 ? 4 : scale,
      "-m",
      modelsPath,
      "-n",
      model,
    ],
    {
      cwd: null,
      detached: false,
    }
  );
  let failed = false;
  upscayl.stderr.on("data", (stderr) => {
    console.log(stderr.toString());
    stderr = stderr.toString();
    if (stderr.includes("invalid gpu")) {
      failed = true;
    }
    mainWindow.webContents.send(commands.UPSCAYL_PROGRESS, stderr.toString());
  });

  upscayl.on("close", (code) => {
    if (failed !== true) {
      console.log("Done upscaling");
      mainWindow.webContents.send(
        commands.UPSCAYL_DONE,
        outputDir + "scaled" + fileExt
      );
    }
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
