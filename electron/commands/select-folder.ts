import { dialog } from "electron";
import { folderPath, setFolderPath } from "../utils/config-variables";
import logit from "../utils/logit";
import { settings } from "../utils/settings";

const selectFolder = async (event, message) => {
  const {
    canceled,
    filePaths: folderPaths,
    bookmarks,
  } = await dialog.showOpenDialog({
    properties: ["openDirectory"],
    defaultPath: folderPath,
    securityScopedBookmarks: true,
  });

  if (bookmarks && bookmarks.length > 0) {
    logit("📁 Bookmarks: ", bookmarks);
    settings.set("folder-bookmarks", bookmarks[0]);
  }

  if (canceled) {
    logit("🚫 Select Folder Operation Cancelled");
    return null;
  } else {
    setFolderPath(folderPaths[0]);
    logit("📁 Selected Folder Path: ", folderPath);
    return folderPaths[0];
  }
};

export default selectFolder;
