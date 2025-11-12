import { app, dialog } from "electron";
import fs from "fs";
import path from "path";
import logit from "../utils/logit";
import settings from "electron-settings";
import { FEATURE_FLAGS } from "../../common/feature-flags";

const createFolder = async (event, message) => {
  let closeAccess;
  let defaultPath = app.getPath("documents");
  
  // Try to use the last selected folder as default if available
  const lastFolderPath = await settings.get("batchUpscaylFolderPath") as string | undefined;
  if (lastFolderPath && typeof lastFolderPath === 'string' && fs.existsSync(lastFolderPath)) {
    defaultPath = lastFolderPath;
  }
  
  const folderBookmarks = await settings.get("folder-bookmarks");
  if (FEATURE_FLAGS.APP_STORE_BUILD && folderBookmarks) {
    logit("🚨 Folder Bookmarks: ", folderBookmarks);
    try {
      closeAccess = app.startAccessingSecurityScopedResource(
        folderBookmarks as string,
      );
    } catch (error) {
      logit("📁 Folder Bookmarks Error: ", error);
    }
  }

  const { canceled, filePath, bookmark } = await dialog.showSaveDialog({
    buttonLabel: "Create Folder",
    title: "Create New Output Folder",
    defaultPath: path.join(defaultPath, "Upscayled Images"),
    securityScopedBookmarks: true,
  });

  if (FEATURE_FLAGS.APP_STORE_BUILD && closeAccess) {
    closeAccess();
  }

  if (canceled) {
    logit("🚫 Create Folder Operation Cancelled");
    return null;
  } else {
    // Create the directory if it doesn't exist
    if (!fs.existsSync(filePath)) {
      try {
        fs.mkdirSync(filePath, { recursive: true });
        logit("📁 Created New Folder Path: ", filePath);
        
        // Persist the folder path for future default
        await settings.set("batchUpscaylFolderPath", filePath);
      } catch (error) {
        logit("❌ Error Creating Folder: ", error);
        return null;
      }
    } else {
      logit("📁 Selected Folder Path (already exists): ", filePath);
      
      // Persist the folder path for future default
      await settings.set("batchUpscaylFolderPath", filePath);
    }
    
    // Save bookmark for App Store builds (common for both branches)
    if (FEATURE_FLAGS.APP_STORE_BUILD && bookmark) {
      try {
        await settings.set("folder-bookmarks", bookmark);
        logit("📁 Bookmark saved for App Store access: ", bookmark);
      } catch (settingsError) {
        logit("❌ Error saving bookmark to settings: ", settingsError);
      }
    }
    
    return filePath;
  }
};

export default createFolder;