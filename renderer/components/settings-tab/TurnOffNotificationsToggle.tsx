import { turnOffNotificationsAtom } from "@/atoms/userSettingsAtom";
import { useAtom } from "jotai";

const TurnOffNotificationsToggle = () => {
  const [turnOffNotifications, setTurnOffNotifications] = useAtom(
    turnOffNotificationsAtom
  );

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium">TURN OFF NOTIFICATIONS</p>
      <p className="text-xs text-base-content/80">
        If enabled, Upscayl will not send any system notifications on success or
        failure.
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
