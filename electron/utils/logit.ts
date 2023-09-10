import Logger from "electron-log";
import mainWindow from "../main-window";
import COMMAND from "../constants/commands";

const logit = (...args: any) => {
  Logger.log(...args);
  if (!mainWindow) return;
  mainWindow.webContents.send(COMMAND.LOG, args.join(" "));
};

export default logit;
