import { Notification } from "electron/main";
import { fetchLocalStorage, turnOffNotifications } from "./config-variables";

export default function showNotification(title: string, body: string) {
  fetchLocalStorage();
  if (turnOffNotifications) return;
  new Notification({
    title,
    body,
    closeButtonText: "Close",
  }).show();
}
