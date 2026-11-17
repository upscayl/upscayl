import { shell } from "electron";
import { isAbsolute } from "node:path";
import logit from "../utils/logit";

const showInFolder = async (event, payload) => {
  if (typeof payload !== "string" || !isAbsolute(payload)) {
    logit("❌ Show in Folder: invalid path: ", payload);
    return;
  }
  logit("📂 Showing in Folder: ", payload);
  shell.showItemInFolder(payload);
};

export default showInFolder;
