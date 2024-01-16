import { Notification } from "electron/main";
import { turnOffNotifications } from "./config-variables";

export default function showNotification(title: string, body: string) {
  if (turnOffNotifications) return;
  new Notification({
    title,
    body,
    closeButtonText: "Close",
  }).show();
}
