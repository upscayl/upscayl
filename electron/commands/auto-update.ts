import { MessageBoxOptions, dialog, shell } from "electron";
import { UpdateDownloadedEvent, autoUpdater } from "electron-updater";
import logit from "../utils/logit";

const autoUpdate = (event: UpdateDownloadedEvent) => {
  autoUpdater.autoInstallOnAppQuit = false;
  const dialogOpts: MessageBoxOptions = {
    type: "info",
    buttons: ["Install update", "No Thanks", "Check Release Notes"],
    title: "New Upscayl Update",
    message: event.releaseName as string,
    detail:
      "A new version has been downloaded. Restart the application to apply the updates.",
  };
  logit("✅ Update Downloaded");
  dialog.showMessageBox(dialogOpts).then((returnValue) => {
    if (returnValue.response === 0) {
      autoUpdater.quitAndInstall();
    } else if (returnValue.response === 2) {
      shell.openExternal(
        "https://github.com/upscayl/upscayl/releases/tag/v" + event.version
      );
    } else {
      logit("🚫 Update Installation Cancelled");
    }
  });
};

export default autoUpdate;
