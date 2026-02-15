import { getMainWindow } from "../main-window";
import { ELECTRON_COMMANDS } from "../../common/electron-commands";
import { setBatchPaused } from "../utils/config-variables";

const batchResume = () => {
  setBatchPaused(false);
  const mainWindow = getMainWindow();
  if (mainWindow) {
    mainWindow.webContents.send(ELECTRON_COMMANDS.BATCH_RESUMED);
  }
};

export default batchResume;
