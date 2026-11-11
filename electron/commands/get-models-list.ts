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
  // could point the engine at any folder. A folder the page remembers itself proves nothing, it could have
  // been written by that page, so there is no taking it over: it has to be chosen in the dialog once.
  const folder = path.normalize(payload);
  const trusted = await settings.get(CUSTOM_MODELS_FOLDER_KEY);
  if (trusted !== folder || !isDirectory(folder)) {
    logit("Refused a custom models folder that was not chosen: ", folder);
    return;
  }

  setSavedCustomModelsPath(folder);
  logit("Custom Models Folder Path: ", folder);
  const models = await getModels(folder);

  mainWindow.webContents.send(ELECTRON_COMMANDS.CUSTOM_MODEL_FILES_LIST, models);
};

export default getModelsList;
