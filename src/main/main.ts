/**
 * Entry point of the Election app.
 */
import * as path from "path";
import * as nodeEnv from "_utils/node-env";
// eslint-disable-next-line import/no-extraneous-dependencies
import { BrowserWindow, app, ipcMain } from "electron";

let mainWindow: Electron.BrowserWindow | undefined;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    webPreferences: {
      devTools: nodeEnv.dev,
      preload: path.join(__dirname, "./preload.bundle.js"),
      webSecurity: nodeEnv.prod,
      nodeIntegration: true,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile("index.html").finally(() => {
    /* no action */
  });

  // Emitted when the window is closed.
  mainWindow.on("closed", () => {
    mainWindow = undefined;
  });
}
app.commandLine.appendSwitch("ignore-gpu-blacklist");
app
  .whenReady()
  .then(() => {
    if (nodeEnv.dev || nodeEnv.prod) createWindow();

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows.length === 0) createWindow();
    });
  })
  .finally(() => {
    /* no action */
  });

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// const getUpscaledImage = async () => {
//   const file = fs.readFileSync(path.resolve(__dirname, "./image.png"));
//   const image = tf.node.decodeImage(file, 3);
//   const tensor = await upscaler.upscale(image, {
//     output: "tensor",
//     patchSize: 64,
//     padding: 6,
//   });
//   image.dispose();
//   const upscaledTensor = await tf.node.encodePng(tensor);
//   tensor.dispose();
//   return upscaledTensor;
// };

ipcMain.on("hello", async () => {});

export const exportedForTests = nodeEnv.test ? { createWindow } : undefined;
