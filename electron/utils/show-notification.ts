import { Notification } from "electron/main";
import { turnOffNotifications } from "./config-variables";
import fs from 'fs';

export default function showNotification(title: string, body: string) {
  if (turnOffNotifications) return;

  const iconPaths = [
    "/app/share/icons/hicolor/128x128/apps/org.upscayl.Upscayl.png", // flatpak icon
    "__appImage-x64/usr/share/icons/hicolor/128x128/apps/upscayl.png", // appimage icon
    "/usr/share/icons/hicolor/128x128/apps/upscayl.png", // deb & rpm icon
    "resources/128x128.png", // win icon
    "build/icon.icns", // mac icon
  ];
  
  // Find the first available icon path
  let iconPath = '';
  for (const path of iconPaths) {
    if (fs.existsSync(path)) {
      iconPath = path;
      break;
    }
  }

  const notification = new Notification({
    title,
    body,
    closeButtonText: "Close",
    icon: iconPath,
  }).show();
}
