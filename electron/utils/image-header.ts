import fs from "fs";
import path from "path";

/**
 * The engine decides how to decode a file by what is in it, not by its name, and it has decoders for more
 * formats than the app offers. A file named .png can be a GIF or a PSD and still gets decoded. So a picture only
 * goes to the engine when it starts like one of the three formats the app works with.
 *
 * This keeps out what a download or a copy brings along. It does not stop someone who can already write into the
 * folder: a file can still be swapped between this check and the engine reading it.
 */

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const HEADER_LENGTH = 12;

// What the engine picks up when it is given a folder (is_image_file in upscayl-ncnn)
const ENGINE_FOLDER_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".bmp", ".webp"]);

/** True when the file starts like a PNG, a JPEG or a WebP. A file that cannot be read is not one. */
export const hasImageHeader = async (file: string): Promise<boolean> => {
  let handle: fs.promises.FileHandle | undefined;
  try {
    handle = await fs.promises.open(file, "r");
    const head = Buffer.alloc(HEADER_LENGTH);
    const { bytesRead } = await handle.read(head, 0, HEADER_LENGTH, 0);
    if (bytesRead < HEADER_LENGTH) return false;

    const isPng = PNG_SIGNATURE.every((byte, index) => head[index] === byte);
    const isJpeg = head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff;
    const isWebp =
      head.toString("latin1", 0, 4) === "RIFF" && head.toString("latin1", 8, 12) === "WEBP";
    return isPng || isJpeg || isWebp;
  } catch {
    return false;
  } finally {
    await handle?.close().catch(() => {
      // already closed, nothing to do
    });
  }
};

/**
 * The first file in the folder that the engine would pick up for a batch and that is not a PNG, JPEG or WebP
 * inside. Links are skipped, like the engine does, and so are subfolders. Throws when the folder cannot be read.
 */
export const findForeignPicture = async (folder: string): Promise<string | null> => {
  for (const entry of await fs.promises.readdir(folder, { withFileTypes: true })) {
    if (!entry.isFile()) continue;
    if (!ENGINE_FOLDER_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) continue;
    if (!(await hasImageHeader(path.join(folder, entry.name)))) return entry.name;
  }
  return null;
};
