import { translationAtom } from "@/atoms/translations-atom";
import { ttaModeAtom } from "@/atoms/user-settings-atom";
import { useAtom, useAtomValue } from "jotai";

const TTAModeToggle = () => {
  const [ttaMode, setTTAMode] = useAtom(ttaModeAtom);
  const t = useAtomValue(translationAtom);

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium">{t("SETTINGS.TTA_MODE.TITLE")}</p>
      <p className="text-xs text-base-content/80">
        {t("SETTINGS.TTA_MODE.DESCRIPTION")}
      </p>
      <input
        type="checkbox"
        className="toggle"
        checked={ttaMode}
        onClick={() => {
          setTTAMode(!ttaMode);
        }}
      />
    </div>
  );
};

export default TTAModeToggle;
