import { getMainWindow } from "../main-window";
import { ELECTRON_COMMANDS } from "../../common/electron-commands";
import { setBatchPaused } from "../utils/config-variables";

const batchPause = () => {
  setBatchPaused(true);
  const mainWindow = getMainWindow();
  if (mainWindow) {
    mainWindow.webContents.send(ELECTRON_COMMANDS.BATCH_PAUSED);
  }
};

export default batchPause;
