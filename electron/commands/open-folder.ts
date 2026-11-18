import { shell } from "electron";
import fs from "fs";
import logit from "../utils/logit";
import { isOpenableFolder } from "../utils/openable-folder";

/** Opens the folder of the last batch in the file manager. Anything else the page asks for is ignored. */
const openFolder = async (event, payload) => {
  if (!isOpenableFolder(payload)) {
    logit("Refused to open a folder that is not the result of a batch: ", payload);
    return;
  }
  try {
    if (!fs.statSync(payload).isDirectory()) return;
  } catch {
    return;
  }
  logit("Opening Folder: ", payload);
  shell.openPath(payload);
};

export default openFolder;
