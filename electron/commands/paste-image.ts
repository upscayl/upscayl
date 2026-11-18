import { app } from "electron";
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

const MAX_PASTED_BYTES = 200 * 1024 * 1024;

const isImageFormatValid = (format: string): format is ImageFormat => {
  return (imageFormats as readonly string[]).includes(format);
};

// mkdtemp picks a random name and makes the folder for this user only. A fixed name in a shared temp folder
// (/tmp on Linux) could be made by someone else first.
let sessionPasteDirectory: string | null = null;
const pasteDirectory = () =>
  (sessionPasteDirectory ??= fs.mkdtempSync(
    path.join(app.getPath("temp"), "upscayl-paste-"),
  ));

/** Pasted images live in the system's temp folder, not in the user's folders; removed at quit. */
export const cleanUpPastedImages = () => {
  if (!sessionPasteDirectory) return;
  try {
    fs.rmSync(sessionPasteDirectory, { recursive: true, force: true });
  } catch {
    // Nothing to remove, or in use: the system's temp cleaning takes it.
  }
};

const pasteImage = async (
  event: Electron.IpcMainEvent,
  file: IClipboardFileParameters,
) => {
  const mainWindow = getMainWindow();
  if (!mainWindow) return;
  if (
    !file ||
    typeof file.name !== "string" ||
    typeof file.encodedBuffer !== "string" ||
    !file.encodedBuffer
  )
    return;

  // Only the last part of the name counts, and the extension is the name's own, not the one the page claims.
  const name = path.basename(file.name);
  const extension = path.extname(name).slice(1).toLowerCase();
  if (!isImageFormatValid(extension)) {
    mainWindow.webContents.send(
      ELECTRON_COMMANDS.PASTE_IMAGE_SAVE_ERROR,
      "Unsupported Image Format",
    );
    return;
  }
  // base64 is a third longer than what it holds
  if (file.encodedBuffer.length > (MAX_PASTED_BYTES * 4) / 3) {
    mainWindow.webContents.send(
      ELECTRON_COMMANDS.PASTE_IMAGE_SAVE_ERROR,
      "The pasted image is too large",
    );
    return;
  }

  try {
    const directory = pasteDirectory();
    await fs.promises.mkdir(directory, { recursive: true, mode: 0o700 });
    const tempFilePath = path.join(directory, name);
    await fs.promises.writeFile(
      tempFilePath,
      Buffer.from(file.encodedBuffer, "base64"),
    );
    mainWindow.webContents.send(
      ELECTRON_COMMANDS.PASTE_IMAGE_SAVE_SUCCESS,
      tempFilePath,
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
