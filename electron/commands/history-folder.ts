import { app, dialog, shell } from "electron";
import settings from "electron-settings";
import { lstat, mkdir, readdir, rm } from "node:fs/promises";
import { isAbsolute } from "node:path";
import { FEATURE_FLAGS } from "../../common/feature-flags";
import { getHistoryDir } from "../utils/history";
import logit from "../utils/logit";

const ENTRY_FILE = /^(original|result)(\.[a-z0-9]+)?$/i;

export const deleteHistoryEntry = async (_event, payload) => {
  if (typeof payload !== "string" || !isAbsolute(payload)) return;
  try {
    const stats = await lstat(payload);
    if (!stats.isDirectory() || stats.isSymbolicLink()) return;
    const files = await readdir(payload, { withFileTypes: true });
    if (
      files.length === 0 ||
      !files.every((file) => file.isFile() && ENTRY_FILE.test(file.name))
    )
      return;
    logit("🗑️ Deleting History Entry: ", payload);
    await rm(payload, { recursive: true, force: true });
  } catch (error) {
    logit("❌ Delete History Entry Error: ", error);
  }
};

export const getHistoryFolder = async () => getHistoryDir();

export const selectHistoryFolder = async () => {
  const { canceled, filePaths, bookmarks } = await dialog.showOpenDialog({
    properties: ["openDirectory", "createDirectory"],
    defaultPath: getHistoryDir(),
    securityScopedBookmarks: true,
  });

  if (canceled || !filePaths[0]) {
    logit("🚫 Select History Folder Operation Cancelled");
    return null;
  }

  if (FEATURE_FLAGS.APP_STORE_BUILD && bookmarks && bookmarks.length > 0) {
    await settings.set("history-folder-bookmarks", bookmarks[0]);
    try {
      app.startAccessingSecurityScopedResource(bookmarks[0]);
    } catch (error) {
      logit("📁 History Folder Bookmarks Error: ", error);
    }
  }

  await settings.set("history-folder", filePaths[0]);
  logit("📁 Selected History Folder Path: ", filePaths[0]);
  return filePaths[0];
};

export const openHistoryFolder = async () => {
  const historyDir = getHistoryDir();
  try {
    await mkdir(historyDir, { recursive: true });
    logit("📂 Opening History Folder: ", historyDir);
    await shell.openPath(historyDir);
  } catch (error) {
    logit("❌ Open History Folder Error: ", error);
  }
};
