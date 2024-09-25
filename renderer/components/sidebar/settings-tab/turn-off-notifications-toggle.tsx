import { translationAtom } from "@/atoms/translations-atom";
import { turnOffNotificationsAtom } from "@/atoms/user-settings-atom";
import { useAtom, useAtomValue } from "jotai";

const TurnOffNotificationsToggle = () => {
  const [turnOffNotifications, setTurnOffNotifications] = useAtom(
    turnOffNotificationsAtom,
  );
  const t = useAtomValue(translationAtom);

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium">
        {t("SETTINGS.TURN_OFF_NOTIFICATIONS.TITLE")}
      </p>
      <p className="text-xs text-base-content/80">
        {t("SETTINGS.TURN_OFF_NOTIFICATIONS.DESCRIPTION")}
      </p>
      <input
        type="checkbox"
        className="toggle"
        checked={turnOffNotifications}
        onClick={() => {
          setTurnOffNotifications(!turnOffNotifications);
        }}
      />
    </div>
  );
};

export default TurnOffNotificationsToggle;
