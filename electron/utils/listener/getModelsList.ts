import { ipcMain } from "electron";
import commands from "../../commands";

export type GetModelsListProps = {
  mainWindow: Electron.BrowserWindow;
  customModelsFolderPath: string | undefined;
  logit: (message: string, ...optionalParams: any[]) => void;
  getModels: (folderPath: string) => string[] | null;
};

export default function ({
  mainWindow,
  customModelsFolderPath,
  logit,
  getModels,
}: GetModelsListProps) {
  ipcMain.on(commands.GET_MODELS_LIST, async (event, payload) => {
    if (payload) {
      customModelsFolderPath = payload;

      logit("📁 Custom Models Folder Path: ", customModelsFolderPath);

      mainWindow.webContents.send(
        commands.CUSTOM_MODEL_FILES_LIST,
        getModels(payload)
      );
    }
  });
}
