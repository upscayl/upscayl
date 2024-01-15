import { Notification } from "electron/main";

export default function showNotification(title: string, body: string) {
  new Notification({
    title,
    body,
    closeButtonText: "Close",
  }).show();
}
