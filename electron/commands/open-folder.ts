import { shell } from "electron";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import logit from "../utils/logit";

const openFolder = async (event: any, payload: string) => {
  logit("📂 Opening Folder: ", payload);
  if (!payload) return;

  let clean = decodeURIComponent(
    String(payload).replace(/^file:\/\/\/?/, ""),
  );
  clean = path.win32 ? path.win32.normalize(clean) : path.normalize(clean);

  let folder = "";
  let isFile = false;
  if (fs.existsSync(clean)) {
    const stat = fs.statSync(clean);
    if (stat.isFile()) {
      isFile = true;
      folder = path.dirname(clean);
    } else {
      folder = clean;
    }
  } else {
    folder = path.dirname(clean);
  }

  if (isFile) {
    shell.showItemInFolder(clean);
  }
  if (folder) {
    shell.openPath(folder);
    if (process.platform === "win32") {
      exec(`explorer.exe "${folder}"`, (err) => {
        if (err) logit("Explorer exec error: ", err);
      });
    }
  }
};

export default openFolder;
