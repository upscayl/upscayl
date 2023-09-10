import COMMAND from "../constants/commands";
import mainWindow from "../main-window";
import {
  getCustomModelsFolderPath,
  setCustomModelsFolderPath,
} from "../utils/config-variables";
import getModels from "../utils/get-models";
import logit from "../utils/logit";

const getModelsList = async (event, payload) => {
  if (!mainWindow) return;
  if (payload) {
    setCustomModelsFolderPath(payload);

    logit("📁 Custom Models Folder Path: ", getCustomModelsFolderPath());

    mainWindow.webContents.send(
      COMMAND.CUSTOM_MODEL_FILES_LIST,
      getModels(payload)
    );
  }
};

export default getModelsList;
