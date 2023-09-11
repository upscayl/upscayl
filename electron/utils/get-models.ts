import fs from "fs";
import logit from "./logit";
import { MessageBoxOptions, dialog } from "electron";

const getModels = (folderPath: string | undefined) => {
  let models: string[] = [];
  let isValid = false;

  if (!folderPath) {
    logit("❌ Invalid Custom Model Folder Detected");
    const options: MessageBoxOptions = {
      type: "error",
      title: "Invalid Folder",
      message:
        "The selected folder does not contain valid model files. Make sure you select the folder that ONLY contains '.param' and '.bin' files.",
      buttons: ["OK"],
    };
    dialog.showMessageBoxSync(options);
    return null;
  }

  // READ CUSTOM MODELS FOLDER
  fs.readdirSync(folderPath).forEach((file) => {
    // log.log("Files in Folder: ", file);
    if (
      file.endsWith(".param") ||
      file.endsWith(".PARAM") ||
      file.endsWith(".bin") ||
      file.endsWith(".BIN")
    ) {
      isValid = true;
      const modelName = file.substring(0, file.lastIndexOf(".")) || file;
      if (!models.includes(modelName)) {
        models.push(modelName);
      }
    }
  });

  if (!isValid) {
    logit("❌ Invalid Custom Model Folder Detected");
    const options: MessageBoxOptions = {
      type: "error",
      title: "Invalid Folder",
      message:
        "The selected folder does not contain valid model files. Make sure you select the folder that ONLY contains '.param' and '.bin' files.",
      buttons: ["OK"],
    };
    dialog.showMessageBoxSync(options);
    return null;
  }

  logit("🔎 Detected Custom Models: ", models);
  return models;
};

export default getModels;
