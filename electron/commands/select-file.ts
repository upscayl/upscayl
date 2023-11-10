import { MessageBoxOptions, app, dialog } from "electron";
import { getMainWindow } from "../main-window";
import { imagePath, setImagePath } from "../utils/config-variables";
import logit from "../utils/logit";
import settings from "electron-settings";

const selectFile = async () => {
  const mainWindow = getMainWindow();

  const { canceled, filePaths, bookmarks } = await dialog.showOpenDialog({
    properties: ["openFile"],
    title: "Select Image",
    defaultPath: imagePath,
    securityScopedBookmarks: true,
    message: "Select Image to Upscale",
    filters: [
      {
        name: "Images",
        extensions: [
          "png",
          "jpg",
          "jpeg",
          "webp",
          "PNG",
          "JPG",
          "JPEG",
          "WEBP",
        ],
      },
    ],
  });

  if (bookmarks && bookmarks.length > 0) {
    console.log("🚨 Setting Bookmark: ", bookmarks);
    settings.set("file-bookmarks", bookmarks[0]);
  }

  if (canceled) {
    logit("🚫 File Operation Cancelled");
    return null;
  } else {
    setImagePath(filePaths[0]);

    let isValid = false;
    // READ SELECTED FILES
    filePaths.forEach((file) => {
      // log.log("Files in Folder: ", file);
      if (
        file.endsWith(".png") ||
        file.endsWith(".jpg") ||
        file.endsWith(".jpeg") ||
        file.endsWith(".webp") ||
        file.endsWith(".JPG") ||
        file.endsWith(".PNG") ||
        file.endsWith(".JPEG") ||
        file.endsWith(".WEBP")
      ) {
        isValid = true;
      }
    });

    if (!isValid) {
      logit("❌ Invalid File Detected");
      const options: MessageBoxOptions = {
        type: "error",
        title: "Invalid File",
        message:
          "The selected file is not a valid image. Make sure you select a '.png', '.jpg', or '.webp' file.",
      };
      if (!mainWindow) return null;
      dialog.showMessageBoxSync(mainWindow, options);
      return null;
    }

    logit("📄 Selected File Path: ", filePaths[0]);
    // CREATE input AND upscaled FOLDER
    return filePaths[0];
  }
};

export default selectFile;
