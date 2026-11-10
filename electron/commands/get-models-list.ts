import fs from "fs";
import path from "path";
import settings from "electron-settings";
import { ELECTRON_COMMANDS } from "../../common/electron-commands";
import { getMainWindow } from "../main-window";
import {
  CUSTOM_MODELS_FOLDER_KEY,
  setSavedCustomModelsPath,
} from "../utils/config-variables";
import getModels from "../utils/get-models";
import logit from "../utils/logit";

const isDirectory = (target: string) => {
  try {
    return fs.statSync(target).isDirectory();
  } catch {
    return false;
  }
};

const getModelsList = async (event, payload) => {
  const mainWindow = getMainWindow();
  if (!mainWindow || typeof payload !== "string" || payload === "") return;

  // The page may only ask for the folder the user chose in the dialog. Otherwise a page that was taken over
  // could point the engine at any folder. One that was remembered before this check existed is taken over
  // once, while no folder has been chosen yet.
  const folder = path.normalize(payload);
  const trusted = await settings.get(CUSTOM_MODELS_FOLDER_KEY);
  if (typeof trusted === "string") {
    if (trusted !== folder) {
      logit("Refused a custom models folder that was not chosen: ", folder);
      return;
    }
  } else {
    if (!isDirectory(folder)) return;
    await settings.set(CUSTOM_MODELS_FOLDER_KEY, folder);
  }

  setSavedCustomModelsPath(folder);
  logit("Custom Models Folder Path: ", folder);
  const models = await getModels(folder);

  mainWindow.webContents.send(ELECTRON_COMMANDS.CUSTOM_MODEL_FILES_LIST, models);
};

export default getModelsList;
