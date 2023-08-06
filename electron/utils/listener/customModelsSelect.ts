import { MessageBoxOptions, dialog, ipcMain } from "electron";
import commands from "../../commands";

export type CustomModelsSelectProps = {
  mainWindow: Electron.BrowserWindow;
  customModelsFolderPath: string | undefined;
  logit: (message: string, ...optionalParams: any[]) => void;
  slash: string;
  getModels: (folderPath: string) => string[] | null;
};

export default function ({
  mainWindow,
  customModelsFolderPath,
  logit,
  slash,
  getModels,
}: CustomModelsSelectProps) {
  ipcMain.handle(
    commands.SELECT_CUSTOM_MODEL_FOLDER,
    async (event, message) => {
      const { canceled, filePaths: folderPaths } = await dialog.showOpenDialog({
        properties: ["openDirectory"],
        title: "Select Custom Models Folder",
        defaultPath: customModelsFolderPath,
      });
      if (canceled) {
        logit("🚫 Select Custom Models Folder Operation Cancelled");
        return null;
      } else {
        customModelsFolderPath = folderPaths[0];

        if (
          !folderPaths[0].endsWith(slash + "models") &&
          !folderPaths[0].endsWith(slash + "models" + slash)
        ) {
          logit(
            "❌ Invalid Custom Models Folder Detected: Not a 'models' folder"
          );
          const options: MessageBoxOptions = {
            type: "error",
            title: "Invalid Folder",
            message:
              "Please make sure that the folder name is 'models' and nothing else.",
            buttons: ["OK"],
          };
          dialog.showMessageBoxSync(options);
          return null;
        }

        mainWindow.webContents.send(
          commands.CUSTOM_MODEL_FILES_LIST,
          getModels(customModelsFolderPath)
        );

        logit("📁 Custom Folder Path: ", customModelsFolderPath);
        return customModelsFolderPath;
      }
    }
  );
}
