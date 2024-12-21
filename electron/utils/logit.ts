import log from "electron-log";
import { getMainWindow } from "../main-window";
import { ELECTRON_COMMANDS } from "../../common/electron-commands";

const logit = (...args: any) => {
  const mainWindow = getMainWindow();
  if (!mainWindow) return;
  log.log(...args);
  // if (process.env.NODE_ENV === "development") {
  //   return;
  // }
  mainWindow.webContents.send(ELECTRON_COMMANDS.LOG, args.join(" "));
};

export default logit;
