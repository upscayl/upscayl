import { nativeTheme } from "electron";
import settings from "electron-settings";
import {
  getMainWindow,
  isVibrant,
  setWindowButtonsHidden,
} from "../main-window";

const setVibrancy = (_event: unknown, enabled: boolean) => {
  // The window is already created in this state, so leave it untouched.
  if (process.platform !== "darwin" || enabled === isVibrant()) return;

  settings.setSync("vibrancy", enabled);
  // Vibrancy follows the system appearance, so pin it to dark for the dark glass theme.
  nativeTheme.themeSource = enabled ? "dark" : "system";
  const mainWindow = getMainWindow();
  mainWindow?.setVibrancy(enabled ? "under-window" : null);
  mainWindow?.setBackgroundColor(enabled ? "#00000000" : "#171717");
  // A see-through window recomputes its shadow from its shape, which leaves stale shadows.
  mainWindow?.setHasShadow(!enabled);
  setWindowButtonsHidden();
};

export default setVibrancy;
