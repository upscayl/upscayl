import { app, dialog, IpcMainEvent, shell } from "electron";
import settings from "electron-settings";
import { mkdir } from "node:fs/promises";
import { FEATURE_FLAGS } from "../../common/feature-flags";
import { getHistoryDir } from "../utils/history";
import logit from "../utils/logit";
import {
  listHistoryEntries,
  deleteHistoryEntry as deleteEntry,
  deleteHistoryEntriesByBatch,
  clearHistoryEntries,
} from "../../database/history";
import { DeleteHistoryTarget } from "@common/types/types";

export const getHistoryEntries = () => listHistoryEntries();

export const deleteHistoryEntry = async (
  _: IpcMainEvent,
  payload: DeleteHistoryTarget,
) => {
  const suffix = payload.mode === "single" ? "y" : "ies";

  try {
    if (payload.mode === "single") {
      deleteEntry(payload.id);
    } else if (payload.mode === "batch") {
      deleteHistoryEntriesByBatch(payload.batch_id);
    } else clearHistoryEntries();

    logit(`🗑️ Deleting History Entr${suffix}`);
  } catch (error) {
    logit(`❌ Delete History Entry${suffix} Error: `, error);
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
