import { getMainWindow } from "../main-window";
import logit from "../utils/logit";
import fs from "fs";
import { tmpdir, homedir } from "os";
import path from "path";
import { ELECTRON_COMMANDS } from "../../common/electron-commands";

interface IClipboardFileParameters {
  name: string;
  extension: string;
  size: number;
  type: string;
  encodedBuffer: string;
}

const createTempFileFromClipboard = (
  appFolderPrefix: string,
  inputFileParams: IClipboardFileParameters,
  onSuccessCallback: (inputFilePath: string, outputFilePath: string) => void,
  onErrorCallback: (error: Error) => void,
) => {
  let tempDirectory = fs.mkdtempSync(path.join(tmpdir(), appFolderPrefix));
  let tempFilePath = path.join(tempDirectory, inputFileParams.name);

  fs.writeFile(
    tempFilePath,
    Buffer.from(inputFileParams.encodedBuffer, "base64"),
    (err) => {
      if (err) {
        onErrorCallback(new Error("No permission to temp folder"));
        return;
      }
      let homeDirectoryAsOutputFolder = homedir();
      onSuccessCallback(tempFilePath, homeDirectoryAsOutputFolder);
    },
  );
};

const pasteImage = (event, file: IClipboardFileParameters) => {
  const mainWindow = getMainWindow();
  if (!mainWindow) return;
  if (!file || !file.name || !file.encodedBuffer) return;
  const appFolderPrefix = "upscayl";
  createTempFileFromClipboard(
    appFolderPrefix,
    file,
    (imageFilePath, homeDirectory) => {
      mainWindow.webContents.send(ELECTRON_COMMANDS.PASTE_IMAGE_SAVE_SUCCESS, [
        imageFilePath,
        homeDirectory,
      ]);
    },
    (error) => {
      logit(error.message);
      mainWindow.webContents.send(
        ELECTRON_COMMANDS.PASTE_IMAGE_SAVE_ERROR,
        error.message,
      );
    },
  );
};

export default pasteImage;
