import { dialog, ipcMain } from "electron";
import commands from "../../commands";

export type SelectFolderProps = {
  folderPath: string;
  logit: (...args: any[]) => void;
};

export default function ({ folderPath, logit }) {
  ipcMain.handle(commands.SELECT_FOLDER, async (event, message) => {
    const { canceled, filePaths: folderPaths } = await dialog.showOpenDialog({
      properties: ["openDirectory"],
      defaultPath: folderPath,
    });

    if (canceled) {
      logit("🚫 Select Folder Operation Cancelled");
      return null;
    } else {
      folderPath = folderPaths[0];
      logit("📁 Selected Folder Path: ", folderPath);
      return folderPaths[0];
    }
  });
}
