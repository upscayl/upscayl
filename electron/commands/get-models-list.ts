import COMMAND from "../constants/commands";
import { getMainWindow } from "../main-window";
import {
  customModelsFolderPath,
  setCustomModelsFolderPath,
} from "../utils/config-variables";
import getModels from "../utils/get-models";
import logit from "../utils/logit";

const getModelsList = async (event, payload) => {
  const mainWindow = getMainWindow();

  if (!mainWindow) return;
  if (payload) {
    setCustomModelsFolderPath(payload);

    logit("📁 Custom Models Folder Path: ", customModelsFolderPath);
    const models = await getModels(payload);

    mainWindow.webContents.send(COMMAND.CUSTOM_MODEL_FILES_LIST, models);
  }
};

export default getModelsList;
