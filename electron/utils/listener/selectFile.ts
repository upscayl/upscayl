import { MessageBoxOptions, dialog, ipcMain } from "electron";
import commands from "../../commands";

export type SelectFileProps = {
  mainWindow: Electron.BrowserWindow;
  imagePath: string;
  logit: (...args: any) => void;
};

export default function ({ mainWindow, imagePath, logit }) {
  ipcMain.handle(commands.SELECT_FILE, async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ["openFile", "multiSelections"],
      title: "Select Image",
      defaultPath: imagePath,
    });

    if (canceled) {
      logit("🚫 File Operation Cancelled");
      return null;
    } else {
      imagePath = filePaths[0];

      let isValid = false;
      // READ SELECTED FILES
      filePaths.forEach((file) => {
        // log.log("Files in Folder: ", file);
        if (
          file.endsWith(".png") ||
          file.endsWith(".jpg") ||
          file.endsWith(".jpeg") ||
          file.endsWith(".webp") ||
          file.endsWith(".JPG") ||
          file.endsWith(".PNG") ||
          file.endsWith(".JPEG") ||
          file.endsWith(".WEBP")
        ) {
          isValid = true;
        }
      });

      if (!isValid) {
        logit("❌ Invalid File Detected");
        const options: MessageBoxOptions = {
          type: "error",
          title: "Invalid File",
          message:
            "The selected file is not a valid image. Make sure you select a '.png', '.jpg', or '.webp' file.",
        };
        dialog.showMessageBoxSync(mainWindow, options);
        return null;
      }

      logit("📄 Selected File Path: ", filePaths[0]);
      // CREATE input AND upscaled FOLDER
      return filePaths[0];
    }
  });
}
