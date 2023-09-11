import { shell } from "electron";
import logit from "../utils/logit";

const openFolder = async (event, payload) => {
  logit("📂 Opening Folder: ", payload);
  shell.openPath(payload);
};

export default openFolder;
