import { MessageBoxOptions, dialog } from "electron";
import {
  savedCustomModelsPath,
  setSavedCustomModelsPath,
} from "../utils/config-variables";
import logit from "../utils/logit";
import slash from "../utils/slash";
import { ELECTRON_COMMANDS } from "../../common/electron-commands";
import getModels from "../utils/get-models";
import { getMainWindow } from "../main-window";
import settings from "electron-settings";
import { FEATURE_FLAGS } from "../../common/feature-flags";

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
    defaultPath: savedCustomModelsPath,
    securityScopedBookmarks: true,
    message: "Select Custom Models Folder that is named 'models'",
  });

  if (FEATURE_FLAGS.APP_STORE_BUILD && bookmarks && bookmarks.length > 0) {
    console.log("🚨 Setting Bookmark: ", bookmarks);
    await settings.set("custom-models-bookmarks", bookmarks[0]);
  }

  if (canceled) {
    logit("🚫 Select Custom Models Folder Operation Cancelled");
    return null;
  } else {
    setSavedCustomModelsPath(folderPaths[0]);

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

    const models = await getModels(savedCustomModelsPath);
    mainWindow.webContents.send(
      ELECTRON_COMMANDS.CUSTOM_MODEL_FILES_LIST,
      models,
    );

    logit("📁 Custom Folder Path: ", savedCustomModelsPath);
    return savedCustomModelsPath;
  }
};

export default customModelsSelect;
