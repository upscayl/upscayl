import { MessageBoxOptions, dialog } from "electron";
import { autoUpdater } from "electron-updater";
import logit from "../utils/logit";

const autoUpdate = (event) => {
  autoUpdater.autoInstallOnAppQuit = false;
  const dialogOpts: MessageBoxOptions = {
    type: "info",
    buttons: ["Install update", "No Thanks"],
    title: "New Upscayl Update",
    message: event.releaseName as string,
    detail:
      "A new version has been downloaded. Restart the application to apply the updates.",
  };
  logit("✅ Update Downloaded");
  dialog.showMessageBox(dialogOpts).then((returnValue) => {
    if (returnValue.response === 0) {
      autoUpdater.quitAndInstall();
    } else {
      logit("🚫 Update Installation Cancelled");
    }
  });
};

export default autoUpdate;
