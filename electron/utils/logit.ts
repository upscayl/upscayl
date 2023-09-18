import log from "electron-log";
import COMMAND from "../constants/commands";
import { getMainWindow } from "../main-window";

const logit = (...args: any) => {
  const mainWindow = getMainWindow();
  if (!mainWindow) return;
  log.log(...args);
  mainWindow.webContents.send(COMMAND.LOG, args.join(" "));
};

export default logit;
