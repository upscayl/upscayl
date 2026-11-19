import { shell } from "electron";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import logit from "../utils/logit";

const openFolder = async (event: any, payload: string) => {
  logit("📂 Opening Folder: ", payload);
  if (!payload) return;

  let clean = String(payload).trim();
  if (clean.startsWith("file://")) {
    try {
      clean = fileURLToPath(clean);
    } catch {
      clean = clean.replace(/^file:\/\/\/?/, "");
    }
  }
  clean = path.normalize(clean);

  try {
    if (fs.existsSync(clean)) {
      const stat = fs.statSync(clean);
      if (stat.isFile()) {
        shell.showItemInFolder(clean);
        return;
      } else {
        await shell.openPath(clean);
        return;
      }
    }

    const parentFolder = path.dirname(clean);
    if (fs.existsSync(parentFolder)) {
      await shell.openPath(parentFolder);
    } else {
      await shell.openPath(clean);
    }
  } catch (error: any) {
    logit("Error in openFolder: ", error?.message || error);
  }
};

export default openFolder;
