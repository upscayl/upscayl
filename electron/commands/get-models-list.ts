import COMMAND from "../constants/commands";
import { getMainWindow } from "../main-window";
import {
  customModelsFolderPath,
  setCustomModelsFolderPath,
} from "../utils/config-variables";
import getModels from "../utils/get-models";
import logit from "../utils/logit";

const mainWindow = getMainWindow();

const getModelsList = async (event, payload) => {
  if (!mainWindow) return;
  if (payload) {
    setCustomModelsFolderPath(payload);

    logit("📁 Custom Models Folder Path: ", customModelsFolderPath);

    mainWindow.webContents.send(
      COMMAND.CUSTOM_MODEL_FILES_LIST,
      getModels(payload)
    );
  }
};

export default getModelsList;
