import { IMAGE_EXTENSIONS } from "@common/constants";
import { ELECTRON_COMMANDS } from "@common/electron-commands";
import { getMainWindow } from "@electron/main-window";
import logit from "@electron/utils/logit";
import { readdirSync } from "fs";
import path from "path";

const getImagePaths = (_, folderPath: string) => {
  const mainWindow = getMainWindow();
  if (!mainWindow) return;

  logit("📂 Getting image paths from folder: " + folderPath);

  let imageFiles: string[];
  try {
    imageFiles = readdirSync(folderPath).filter((file) =>
      IMAGE_EXTENSIONS.has(path.extname(file).toLowerCase()),
    );
  } catch (err) {
    logit("⚠️ Failed to read folder: " + folderPath + " — " + err);
    mainWindow.webContents.send(ELECTRON_COMMANDS.IMAGE_FILES_LIST, {
      images: [],
      folderPath,
    });
    return;
  }

  const images = imageFiles.map((file) => path.join(folderPath, file));

  mainWindow.webContents.send(ELECTRON_COMMANDS.IMAGE_FILES_LIST, {
    images: images && images.length ? images : [],
    folderPath,
  });
};

export default getImagePaths;
