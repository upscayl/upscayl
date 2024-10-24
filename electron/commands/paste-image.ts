import { getMainWindow } from "../main-window";
import logit from "../utils/logit";
import fs from "fs";
import path from "path";
import { ELECTRON_COMMANDS } from "../../common/electron-commands";

interface IClipboardFileParameters {
  name: string;
  path: string;
  extension: string;
  size: number;
  type: string;
  encodedBuffer: string;
}

const createTempFileFromClipboard = async (
  inputFileParams: IClipboardFileParameters,
): Promise<string> => {
  const tempFilePath = path.join(inputFileParams.path, inputFileParams.name);
  const buffer = Buffer.from(inputFileParams.encodedBuffer, "base64");

  await fs.promises.writeFile(tempFilePath, buffer);
  return tempFilePath;
};

const pasteImage = async (event, file: IClipboardFileParameters) => {
  const mainWindow = getMainWindow();
  if (!mainWindow) return;
  if (!file || !file.name || !file.encodedBuffer) return;
  try {
    const imageFilePath = await createTempFileFromClipboard(file);
    mainWindow.webContents.send(
      ELECTRON_COMMANDS.PASTE_IMAGE_SAVE_SUCCESS,
      imageFilePath,
    );
  } catch (error: any) {
    logit(error.message);
    mainWindow.webContents.send(
      ELECTRON_COMMANDS.PASTE_IMAGE_SAVE_ERROR,
      error.message,
    );
  }
};

export default pasteImage;
