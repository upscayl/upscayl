import { MessageBoxOptions, dialog } from "electron";
import {
  customModelsFolderPath,
  setCustomModelsFolderPath,
} from "../utils/config-variables";
import logit from "../utils/logit";
import slash from "../utils/slash";
import COMMAND from "../constants/commands";
import getModels from "../utils/get-models";
import { getMainWindow } from "../main-window";
import { settings } from "../utils/settings";

const customModelsSelect = async (event, message) => {
  const mainWindow = getMainWindow();

  if (!mainWindow) return;
  const {
    canceled,
    filePaths: folderPaths,
    bookmarks,
  } = await dialog.showOpenDialog({
    properties: ["openDirectory"],
    title: "Select Custom Models Folder",
    defaultPath: customModelsFolderPath,
    securityScopedBookmarks: true,
  });

  if (bookmarks && bookmarks.length > 0) {
    logit("📁 Bookmarks: ", bookmarks);
    settings.set("custom-models-bookmarks", bookmarks[0]);
  }

  if (canceled) {
    logit("🚫 Select Custom Models Folder Operation Cancelled");
    return null;
  } else {
    setCustomModelsFolderPath(folderPaths[0]);

    if (
      !folderPaths[0].endsWith(slash + "models") &&
      !folderPaths[0].endsWith(slash + "models" + slash)
    ) {
      logit("❌ Invalid Custom Models Folder Detected: Not a 'models' folder");
      const options: MessageBoxOptions = {
        type: "error",
        title: "Invalid Folder",
        message:
          "Please make sure that the folder name is 'models' and nothing else.",
        buttons: ["OK"],
      };
      dialog.showMessageBoxSync(options);
      return null;
    }

    mainWindow.webContents.send(
      COMMAND.CUSTOM_MODEL_FILES_LIST,
      getModels(customModelsFolderPath)
    );

    logit("📁 Custom Folder Path: ", customModelsFolderPath);
    return customModelsFolderPath;
  }
};

export default customModelsSelect;
