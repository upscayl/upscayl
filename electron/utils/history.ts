import { app } from "electron";
import settings from "electron-settings";
import { copyFile, mkdir, rm } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { basename, extname, join, parse } from "node:path";
import { ELECTRON_COMMANDS } from "../../common/electron-commands";
import { HistoryEntry } from "../../common/types/types";
import { getMainWindow } from "../main-window";
import logit from "./logit";

export const getHistoryDir = () =>
  (settings.getSync("history-folder") as string | undefined) ||
  join(app.getPath("pictures"), "Upscayl History");

const pad = (n: number) => String(n).padStart(2, "0");

// Matches the delete guard in electron/commands/history-folder.ts.
const safeExtname = (path: string) => {
  const ext = extname(path).toLowerCase();
  return /^\.[a-z0-9]+$/.test(ext) ? ext : "";
};

const entryFolderName = (date: Date, originalPath: string) => {
  const base =
    parse(originalPath)
      .name.replace(/[<>:"/\\|?*#%\x00-\x1f]/g, "_")
      .trim()
      .replace(/[. ]+$/, "")
      .slice(0, 60) || "image";
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}-${pad(date.getMinutes())}-${pad(date.getSeconds())} ${base}`;
};

const createEntryFolder = async (name: string) => {
  const historyDir = getHistoryDir();
  await mkdir(historyDir, { recursive: true });
  for (let i = 1; ; i++) {
    const folderPath = join(historyDir, i === 1 ? name : `${name} (${i})`);
    try {
      await mkdir(folderPath);
      return folderPath;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
    }
  }
};

export const saveHistoryEntry = async (
  input: Omit<HistoryEntry, "id" | "createdAt" | "folderPath" | "name">,
) => {
  const createdAt = Date.now();
  let entry: HistoryEntry = {
    ...input,
    id: randomUUID(),
    createdAt,
    name: basename(
      input.kind === "batch-upscayl" ? input.outputPath : input.originalPath,
    ),
  };
  let folderPath: string | undefined;
  try {
    if (input.kind !== "batch-upscayl") {
      folderPath = await createEntryFolder(
        entryFolderName(new Date(createdAt), input.originalPath),
      );
      const originalPath = join(
        folderPath,
        `original${safeExtname(input.originalPath)}`,
      );
      const outputPath = join(
        folderPath,
        `result${safeExtname(input.outputPath)}`,
      );
      await copyFile(input.originalPath, originalPath);
      await copyFile(input.outputPath, outputPath);
      entry = { ...entry, folderPath, originalPath, outputPath };
    }
  } catch (error) {
    logit("❌ History Copy Error: ", error);
    if (folderPath)
      await rm(folderPath, { recursive: true, force: true }).catch(() => {});
    // Copy failed: still record the job, pointing at the original source paths.
    entry = { ...entry, folderPath: undefined };
  }
  getMainWindow()?.webContents.send(
    ELECTRON_COMMANDS.HISTORY_ENTRY_ADDED,
    entry,
  );
};
