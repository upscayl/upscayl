import COMMAND from "../../common/commands";
import { getMainWindow } from "../main-window";
import {
  savedCustomModelsPath,
  setSavedCustomModelsPath,
} from "../utils/config-variables";
import getModels from "../utils/get-models";
import logit from "../utils/logit";

const getModelsList = async (event, payload) => {
  const mainWindow = getMainWindow();

  if (!mainWindow) return;
  if (payload) {
    setSavedCustomModelsPath(payload);

    logit("📁 Custom Models Folder Path: ", savedCustomModelsPath);
    const models = await getModels(payload);

    mainWindow.webContents.send(COMMAND.CUSTOM_MODEL_FILES_LIST, models);
  }
};

export default getModelsList;
