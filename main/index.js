// Native
const { join } = require("path");
const { format } = require("url");
const { exec } = require("child_process");
const fs = require("fs");

// Packages
const { BrowserWindow, app, ipcMain } = require("electron");
const isDev = require("electron-is-dev");
const prepareNext = require("electron-next");

// Prepare the renderer once the app is ready
app.on("ready", async () => {
  await prepareNext("./renderer");

  const mainWindow = new BrowserWindow({
    width: 400,
    height: 750,
    webPreferences: {
      autoHideMenuBar: true,
      nodeIntegration: false,
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
  mainWindow.setResizable(false);
  mainWindow.loadURL(url);
});

// Quit the app once all windows are closed
app.on("window-all-closed", app.quit);

// listen the channel `message` and resend the received message to the renderer process
ipcMain.on("message", (event, message) => {
  console.log(message);
  let text = `[Desktop Entry]
Encoding=UTF-8
Name=${message.name}
Comment=${message.comment}
Exec=${message.exec}
Icon=${message.icon}
Terminal=${message.terminal}
Type=Application
Categories=GNOME;Application;Utility;
`;

  try {
    const homePath = app.getPath("home");
    let filePath =
      homePath +
      "/.local/share/applications/" +
      message.name.replace(/[^A-Z0-9]+/gi, "_") +
      ".desktop";

    console.log(filePath);

    fs.writeFileSync(filePath, text, "utf-8");

    exec(`chmod +x ${filePath}`, (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
    });
  } catch (e) {
    alert("Failed to save the file !");
  }
});
