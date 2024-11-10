import { getMainWindow } from "../main-window";
import logit from "../utils/logit";
import fs from "fs";
import path from "path";
import { ELECTRON_COMMANDS } from "../../common/electron-commands";
import { ImageFormat } from "../types/types";
import { imageFormats } from "../../common/image-formats";

interface IClipboardFileParameters {
  name: string;
  path: string;
  extension: ImageFormat;
  size: number;
  type: string;
  encodedBuffer: string;
}

const isImageFormatValid = (format: string): format is ImageFormat => {
  return (imageFormats as readonly string[]).includes(format);
};

const createTempFileFromClipboard = async (
  inputFileParams: IClipboardFileParameters,
): Promise<string> => {
  const tempFilePath = path.join(inputFileParams.path, inputFileParams.name);
  const buffer = Buffer.from(inputFileParams.encodedBuffer, "base64");

  await fs.promises.writeFile(tempFilePath, buffer);
  return tempFilePath;
};

const pasteImage = async (
  event: Electron.IpcMainEvent,
  file: IClipboardFileParameters,
) => {
  const mainWindow = getMainWindow();
  if (!mainWindow) return;
  if (!file || !file.name || !file.encodedBuffer) return;
  if (isImageFormatValid(file.extension)) {
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
  } else {
    mainWindow.webContents.send(
      ELECTRON_COMMANDS.PASTE_IMAGE_SAVE_ERROR,
      "Unsupported Image Format",
    );
  }
};

export default pasteImage;
