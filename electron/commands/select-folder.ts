import { dialog } from "electron";
import { folderPath, setFolderPath } from "../utils/config-variables";
import logit from "../utils/logit";

const selectFolder = async (event, message) => {
  const { canceled, filePaths: folderPaths } = await dialog.showOpenDialog({
    properties: ["openDirectory"],
    defaultPath: folderPath,
  });

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
