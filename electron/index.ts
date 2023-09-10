import { autoUpdater } from "electron-updater";
import log from "electron-log";
import { app, ipcMain, dialog, MessageBoxOptions } from "electron";
import COMMAND from "./constants/commands";
import logit from "./utils/logit";
import openFolder from "./commands/open-folder";
import stop from "./commands/stop";
import selectFolder from "./commands/select-folder";
import selectFile from "./commands/select-file";
import getModelsList from "./commands/get-models-list";
import customModelsSelect from "./commands/custom-models-select";
import imageUpscayl from "./commands/image-upscayl";
import { setStop } from "./utils/config-variables";

// INITIALIZATION
setStop(false);
log.initialize({ preload: true });

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

// Quit the app once all windows are closed
app.on("window-all-closed", app.quit);
logit("🚃 App Path: ", app.getAppPath());

//------------------------Open Folder-----------------------------//
ipcMain.on(COMMAND.OPEN_FOLDER, openFolder);

//------------------------Stop Command-----------------------------//
ipcMain.on(COMMAND.STOP, stop);

//------------------------Select Folder-----------------------------//
ipcMain.handle(COMMAND.SELECT_FOLDER, selectFolder);

//------------------------Select File-----------------------------//
ipcMain.handle(COMMAND.SELECT_FILE, selectFile);

//------------------------Get Models List-----------------------------//
ipcMain.on(COMMAND.GET_MODELS_LIST, getModelsList);

//------------------------Custom Models Select-----------------------------//
ipcMain.handle(COMMAND.SELECT_CUSTOM_MODEL_FOLDER, customModelsSelect);

//------------------------Image Upscayl-----------------------------//
ipcMain.on(COMMAND.UPSCAYL, imageUpscayl);

//------------------------Batch Upscayl-----------------------------//
// ipcMain.on(COMMAND.FOLDER_UPSCAYL, async (event, payload) => {
//   if (!mainWindow) return;
//   // GET THE MODEL
//   const model = payload.model;
//   const gpuId = payload.gpuId;
//   const saveImageAs = payload.saveImageAs;
//   // const scale = payload.scale as string;

//   // GET THE IMAGE DIRECTORY
//   let inputDir = payload.batchFolderPath;
//   // GET THE OUTPUT DIRECTORY
//   let outputDir = payload.outputPath;

//   if (saveOutputFolder === true && outputFolderPath) {
//     outputDir = outputFolderPath;
//   }

//   const isDefaultModel = defaultModels.includes(model);

//   let scale = "4";
//   if (model.includes("x2")) {
//     scale = "2";
//   } else if (model.includes("x3")) {
//     scale = "3";
//   } else {
//     scale = "4";
//   }

//   outputDir += `_${model}_x${payload.scale}`;
//   if (!fs.existsSync(outputDir)) {
//     fs.mkdirSync(outputDir, { recursive: true });
//   }

//   // Delete .DS_Store files
//   fs.readdirSync(inputDir).forEach((file) => {
//     if (file === ".DS_Store") {
//       logit("🗑️ Deleting .DS_Store file");
//       fs.unlinkSync(inputDir + slash + file);
//     }
//   });

//   // UPSCALE
//   const upscayl = spawnUpscayl(
//     "realesrgan",
//     getBatchArguments(
//       inputDir,
//       outputDir,
//       isDefaultModel ? modelsPath : customModelsFolderPath ?? modelsPath,
//       model,
//       gpuId,
//       "png",
//       scale
//     ),
//     logit
//   );

//   childProcesses.push(upscayl);

//   stopped = false;
//   let failed = false;

//   const onData = (data: any) => {
//     if (!mainWindow) return;
//     data = data.toString();
//     mainWindow.webContents.send(
//       COMMAND.FOLDER_UPSCAYL_PROGRESS,
//       data.toString()
//     );
//     if (data.includes("invalid") || data.includes("failed")) {
//       logit("❌ INVALID GPU OR INVALID FILES IN FOLDER - FAILED");
//       failed = true;
//       upscayl.kill();
//     }
//   };
//   const onError = (data: any) => {
//     if (!mainWindow) return;
//     mainWindow.setProgressBar(-1);
//     mainWindow.webContents.send(
//       COMMAND.FOLDER_UPSCAYL_PROGRESS,
//       data.toString()
//     );
//     failed = true;
//     upscayl.kill();
//     mainWindow &&
//       mainWindow.webContents.send(
//         COMMAND.UPSCAYL_ERROR,
//         "Error upscaling image. Error: " + data
//       );
//     return;
//   };
//   const onClose = () => {
//     if (!mainWindow) return;
//     if (!failed && !stopped) {
//       logit("💯 Done upscaling");
//       logit("♻ Scaling and converting now...");
//       upscayl.kill();
//       mainWindow && mainWindow.webContents.send(COMMAND.SCALING_AND_CONVERTING);
//       // Get number of files in output folder
//       const files = fs.readdirSync(inputDir);
//       try {
//         files.forEach(async (file) => {
//           console.log("Filename: ", file.slice(0, -3));
//           await convertAndScale(
//             inputDir + slash + file,
//             outputDir + slash + file.slice(0, -3) + "png",
//             outputDir + slash + file.slice(0, -3) + saveImageAs,
//             payload.scale,
//             saveImageAs,
//             onError
//           );
//           // Remove the png file (default) if the saveImageAs is not png
//           if (saveImageAs !== "png") {
//             fs.unlinkSync(outputDir + slash + file.slice(0, -3) + "png");
//           }
//         });
//         mainWindow.webContents.send(COMMAND.FOLDER_UPSCAYL_DONE, outputDir);
//       } catch (error) {
//         logit("❌ Error processing (scaling and converting) the image.", error);
//         upscayl.kill();
//         mainWindow &&
//           mainWindow.webContents.send(
//             COMMAND.UPSCAYL_ERROR,
//             "Error processing (scaling and converting) the image. Please report this error on Upscayl GitHub Issues page."
//           );
//       }
//     } else {
//       upscayl.kill();
//     }
//   };

//   upscayl.process.stderr.on("data", onData);
//   upscayl.process.on("error", onError);
//   upscayl.process.on("close", onClose);
// });

// //------------------------Double Upscayl-----------------------------//
// ipcMain.on(COMMAND.DOUBLE_UPSCAYL, async (event, payload) => {
//   if (!mainWindow) return;

//   const model = payload.model as string;
//   const imagePath = payload.imagePath;
//   let inputDir = (imagePath.match(/(.*)[\/\\]/) || [""])[1];
//   let outputDir = path.normalize(payload.outputPath);

//   if (saveOutputFolder === true && outputFolderPath) {
//     outputDir = outputFolderPath;
//   }
//   const gpuId = payload.gpuId as string;
//   const saveImageAs = payload.saveImageAs as string;

//   const isDefaultModel = defaultModels.includes(model);

//   // COPY IMAGE TO TMP FOLDER

//   const fullfileName = imagePath.split(slash).slice(-1)[0] as string;
//   const fileName = parse(fullfileName).name;
//   const outFile =
//     outputDir + slash + fileName + "_upscayl_16x_" + model + "." + saveImageAs;

//   let scale = "4";
//   if (model.includes("x2")) {
//     scale = "2";
//   } else if (model.includes("x3")) {
//     scale = "3";
//   } else {
//     scale = "4";
//   }

//   // UPSCALE
//   let upscayl = spawnUpscayl(
//     "realesrgan",
//     getDoubleUpscaleArguments(
//       inputDir,
//       fullfileName,
//       outFile,
//       isDefaultModel ? modelsPath : customModelsFolderPath ?? modelsPath,
//       model,
//       gpuId,
//       saveImageAs,
//       scale
//     ),
//     logit
//   );

//   childProcesses.push(upscayl);

//   stopped = false;
//   let failed = false;
//   let isAlpha = false;
//   let failed2 = false;

//   const onData = (data) => {
//     if (!mainWindow) return;
//     // CONVERT DATA TO STRING
//     data = data.toString();
//     // SEND UPSCAYL PROGRESS TO RENDERER
//     mainWindow.webContents.send(COMMAND.DOUBLE_UPSCAYL_PROGRESS, data);
//     // IF PROGRESS HAS ERROR, UPSCAYL FAILED
//     if (data.includes("invalid gpu") || data.includes("failed")) {
//       upscayl.kill();
//       failed = true;
//     }
//     if (data.includes("has alpha channel")) {
//       isAlpha = true;
//     }
//   };

//   const onError = (data) => {
//     if (!mainWindow) return;
//     mainWindow.setProgressBar(-1);
//     data.toString();
//     // SEND UPSCAYL PROGRESS TO RENDERER
//     mainWindow.webContents.send(COMMAND.DOUBLE_UPSCAYL_PROGRESS, data);
//     // SET FAILED TO TRUE
//     failed = true;
//     mainWindow &&
//       mainWindow.webContents.send(
//         COMMAND.UPSCAYL_ERROR,
//         "Error upscaling image. Error: " + data
//       );
//     upscayl.kill();
//     return;
//   };

//   const onClose2 = async (code) => {
//     if (!mainWindow) return;
//     if (!failed2 && !stopped) {
//       logit("💯 Done upscaling");
//       logit("♻ Scaling and converting now...");
//       mainWindow.webContents.send(COMMAND.SCALING_AND_CONVERTING);
//       try {
//         const originalImage = await sharp(
//           inputDir + slash + fullfileName
//         ).metadata();
//         if (!mainWindow || !originalImage) {
//           throw new Error("Could not grab the original image!");
//         }
//         // Resize the image to the scale
//         const newImage = sharp(isAlpha ? outFile + ".png" : outFile)
//           .resize(
//             originalImage.width &&
//               originalImage.width * parseInt(payload.scale),
//             originalImage.height &&
//               originalImage.height * parseInt(payload.scale)
//           )
//           .withMetadata(); // Keep metadata
//         // Change the output according to the saveImageAs
//         if (saveImageAs === "png") {
//           newImage.png({ quality: 100 - quality });
//         } else if (saveImageAs === "jpg") {
//           newImage.jpeg({ quality: 100 - quality });
//         }
//         // Save the image
//         await newImage
//           .toFile(isAlpha ? outFile + ".png" : outFile)
//           .then(() => {
//             logit(
//               "✅ Done converting to: ",
//               isAlpha ? outFile + ".png" : outFile
//             );
//           })
//           .catch((error) => {
//             logit("❌ Error converting to: ", saveImageAs, error);
//             upscayl.kill();
//             onError(error);
//           });
//         mainWindow.setProgressBar(-1);
//         mainWindow.webContents.send(
//           COMMAND.DOUBLE_UPSCAYL_DONE,
//           isAlpha
//             ? (outFile + ".png").replace(
//                 /([^/\\]+)$/i,
//                 encodeURIComponent((outFile + ".png").match(/[^/\\]+$/i)![0])
//               )
//             : outFile.replace(
//                 /([^/\\]+)$/i,
//                 encodeURIComponent(outFile.match(/[^/\\]+$/i)![0])
//               )
//         );
//       } catch (error) {
//         logit("❌ Error reading original image metadata", error);
//         mainWindow &&
//           mainWindow.webContents.send(
//             COMMAND.UPSCAYL_ERROR,
//             "Error processing (scaling and converting) the image. Please report this error on Upscayl GitHub Issues page."
//           );
//         upscayl.kill();
//       }
//     }
//   };

//   upscayl.process.stderr.on("data", onData);
//   upscayl.process.on("error", onError);
//   upscayl.process.on("close", (code) => {
//     // IF NOT FAILED
//     if (!failed && !stopped) {
//       // UPSCALE
//       let upscayl2 = spawnUpscayl(
//         "realesrgan",
//         getDoubleUpscaleSecondPassArguments(
//           isAlpha,
//           outFile,
//           isDefaultModel ? modelsPath : customModelsFolderPath ?? modelsPath,
//           model,
//           gpuId,
//           saveImageAs,
//           scale
//         ),
//         logit
//       );

//       childProcesses.push(upscayl2);

//       upscayl2.process.stderr.on("data", (data) => {
//         if (!mainWindow) return;
//         // CONVERT DATA TO STRING
//         data = data.toString();
//         // SEND UPSCAYL PROGRESS TO RENDERER
//         mainWindow.webContents.send(COMMAND.DOUBLE_UPSCAYL_PROGRESS, data);
//         // IF PROGRESS HAS ERROR, UPSCAYL FAILED
//         if (data.includes("invalid gpu") || data.includes("failed")) {
//           upscayl2.kill();
//           failed2 = true;
//         }
//       });
//       upscayl2.process.on("error", (data) => {
//         if (!mainWindow) return;
//         data.toString();
//         // SEND UPSCAYL PROGRESS TO RENDERER
//         mainWindow.webContents.send(COMMAND.DOUBLE_UPSCAYL_PROGRESS, data);
//         // SET FAILED TO TRUE
//         failed2 = true;
//         mainWindow &&
//           mainWindow.webContents.send(
//             COMMAND.UPSCAYL_ERROR,
//             "Error upscaling image. Error: " + data
//           );
//         upscayl2.kill();
//         return;
//       });
//       upscayl2.process.on("close", onClose2);
//     }
//   });
// });

//------------------------Auto-Update Code-----------------------------//
autoUpdater.autoInstallOnAppQuit = false;

autoUpdater.on("update-downloaded", (event) => {
  autoUpdater.autoInstallOnAppQuit = false;
  const dialogOpts: MessageBoxOptions = {
    type: "info",
    buttons: ["Install update", "No Thanks"],
    title: "New Upscayl Update",
    message: event.releaseName as string,
    detail:
      "A new version has been downloaded. Restart the application to apply the updates.",
  };
  logit("✅ Update Downloaded");
  dialog.showMessageBox(dialogOpts).then((returnValue) => {
    if (returnValue.response === 0) {
      autoUpdater.quitAndInstall();
    } else {
      logit("🚫 Update Installation Cancelled");
    }
  });
});
