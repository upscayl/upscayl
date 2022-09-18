// Native
const { join, parse } = require("path");
const { format } = require("url");
const { spawn } = require("child_process");
const fs = require("fs");
const sizeOf = require("image-size");
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

// Prepare the renderer once the app is ready
let mainWindow;
app.on("ready", async () => {
  await prepareNext("./renderer");

  console.log("🚀 Icon Path: ", join(__dirname, "icon.png"));
  console.log("🚀 Development Mode? :", isDev);
  console.log("🚀 RS Executable Path: ", execPath(""));
  console.log("🚀 Models: ", modelsPath);

  mainWindow = new BrowserWindow({
    icon: join(__dirname, "build", "icon.png"),
    width: 1100,
    height: 700,
    minHeight: 500,
    minWidth: 500,
    show: false,
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
  mainWindow.loadURL(url);

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
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

//------------------------Double Upscayl-----------------------------//
ipcMain.on(commands.DOUBLE_UPSCAYL, async (event, payload) => {
  const model = payload.model;
  let inputDir = payload.imagePath.match(/(.*)[\/\\]/)[1] || "";
  let outputDir = payload.outputPath;
  console.log(outputDir);

  // COPY IMAGE TO TMP FOLDER
  const platform = getPlatform();
  const fullfileName =
    platform === "win"
      ? payload.imagePath.split("\\").slice(-1)[0]
      : payload.imagePath.split("/").slice(-1)[0];
  const fileName = parse(fullfileName).name;
  const fileExt = parse(fullfileName).ext;
  const outFile = outputDir + "/" + fileName + "_upscayl_8x_" + model + fileExt;

  // UPSCALE
  let upscayl = spawn(
    execPath("realesrgan"),
    [
      "-i",
      inputDir + "/" + fullfileName,
      "-o",
      outFile,
      "-s",
      4,
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
  // TAKE UPSCAYL OUTPUT
  upscayl.stderr.on("data", (data) => {
    // CONVERT DATA TO STRING
    data = data.toString();
    // PRINT TO CONSOLE
    console.log(data);
    // SEND UPSCAYL PROGRESS TO RENDERER
    mainWindow.webContents.send(commands.DOUBLE_UPSCAYL_PROGRESS, data);
    // IF PROGRESS HAS ERROR, UPSCAYL FAILED
    if (data.includes("invalid gpu") || data.includes("failed")) {
      failed = true;
    }
  });

  // IF ERROR
  upscayl.on("error", (data) => {
    data.toString();
    // SEND UPSCAYL PROGRESS TO RENDERER
    mainWindow.webContents.send(commands.DOUBLE_UPSCAYL_PROGRESS, data);
    // SET FAILED TO TRUE
    failed = true;
    return;
  });

  // ON UPSCAYL DONE
  upscayl.on("close", (code) => {
    // IF NOT FAILED
    if (!failed) {
      // UPSCALE
      let upscayl2 = spawn(
        execPath("realesrgan"),
        ["-i", outFile, "-o", outFile, "-s", 4, "-m", modelsPath, "-n", model],
        {
          cwd: null,
          detached: false,
        }
      );

      let failed2 = false;
      // TAKE UPSCAYL OUTPUT
      upscayl2.stderr.on("data", (data) => {
        // CONVERT DATA TO STRING
        data = data.toString();
        // PRINT TO CONSOLE
        console.log(data);
        // SEND UPSCAYL PROGRESS TO RENDERER
        mainWindow.webContents.send(commands.DOUBLE_UPSCAYL_PROGRESS, data);
        // IF PROGRESS HAS ERROR, UPSCAYL FAILED
        if (data.includes("invalid gpu") || data.includes("failed")) {
          failed2 = true;
        }
      });

      // IF ERROR
      upscayl2.on("error", (data) => {
        data.toString();
        // SEND UPSCAYL PROGRESS TO RENDERER
        mainWindow.webContents.send(commands.DOUBLE_UPSCAYL_PROGRESS, data);
        // SET FAILED TO TRUE
        failed2 = true;
        return;
      });

      upscayl2.on("close", (code) => {
        if (!failed2) {
          console.log("Done upscaling");
          mainWindow.webContents.send(commands.DOUBLE_UPSCAYL_DONE, outFile);
        }
      });
    }
  });
});

//------------------------Image Upscayl-----------------------------//
ipcMain.on(commands.UPSCAYL, async (event, payload) => {
  const model = payload.model;
  const scale = payload.scaleFactor;
  let inputDir = payload.imagePath.match(/(.*)[\/\\]/)[1] || "";
  let outputDir = payload.outputPath;

  // COPY IMAGE TO TMP FOLDER
  const platform = getPlatform();
  const fullfileName =
    platform === "win"
      ? payload.imagePath.split("\\").slice(-1)[0]
      : payload.imagePath.split("/").slice(-1)[0];
  console.log(fullfileName);
  const fileName = parse(fullfileName).name;
  const fileExt = parse(fullfileName).ext;
  const outFile =
    outputDir + "/" + fileName + "_upscayl_" + scale + "x_" + model + fileExt;
  // UPSCALE
  if (fs.existsSync(outFile)) {
    // If already upscayled, just output that file
    mainWindow.webContents.send(commands.UPSCAYL_DONE, outFile);
  } else {
    let upscayl = spawn(
      execPath("realesrgan"),
      [
        "-i",
        inputDir + "/" + fullfileName,
        "-o",
        outFile,
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
    upscayl.stderr.on("data", (data) => {
      console.log(
        "🚀 => upscayl.stderr.on => stderr.toString()",
        data.toString()
      );
      data = data.toString();
      mainWindow.webContents.send(commands.UPSCAYL_PROGRESS, data.toString());
      if (data.includes("invalid gpu") || data.includes("failed")) {
        failed = true;
      }
    });

    upscayl.on("error", (data) => {
      mainWindow.webContents.send(commands.UPSCAYL_PROGRESS, data.toString());
      failed = true;
      return;
    });

    // Send done comamnd when
    upscayl.on("close", (code) => {
      if (failed !== true) {
        console.log("Done upscaling");
        mainWindow.webContents.send(commands.UPSCAYL_DONE, outFile);
      }
    });
  }
});

//------------------------Upscayl Folder-----------------------------//
ipcMain.on(commands.FOLDER_UPSCAYL, async (event, payload) => {
  const model = payload.model;
  let inputDir = payload.batchFolderPath;
  let outputDir = payload.outputPath;
  console.log(outputDir);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  // UPSCALE
  let upscayl = spawn(
    execPath("realesrgan"),
    ["-i", inputDir, "-o", outputDir, "-s", 4, "-m", modelsPath, "-n", model],
    {
      cwd: null,
      detached: false,
    }
  );

  let failed = false;
  upscayl.stderr.on("data", (data) => {
    console.log(
      "🚀 => upscayl.stderr.on => stderr.toString()",
      data.toString()
    );
    data = data.toString();
    mainWindow.webContents.send(
      commands.FOLDER_UPSCAYL_PROGRESS,
      data.toString()
    );
    if (data.includes("invalid gpu") || data.includes("failed")) {
      failed = true;
    }
  });

  upscayl.on("error", (data) => {
    mainWindow.webContents.send(
      commands.FOLDER_UPSCAYL_PROGRESS,
      data.toString()
    );
    failed = true;
    return;
  });

  // Send done comamnd when
  upscayl.on("close", (code) => {
    if (failed !== true) {
      console.log("Done upscaling");
      mainWindow.webContents.send(commands.FOLDER_UPSCAYL_DONE, outputDir);
    }
  });
});

//------------------------Auto-Update Code-----------------------------//
// ! AUTO UPDATE STUFF
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
