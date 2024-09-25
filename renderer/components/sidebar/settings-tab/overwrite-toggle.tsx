import { translationAtom } from "@/atoms/translations-atom";
import { overwriteAtom } from "@/atoms/user-settings-atom";
import { useAtom, useAtomValue } from "jotai";
import React, { useEffect } from "react";

const OverwriteToggle = () => {
  const [overwrite, setOverwrite] = useAtom(overwriteAtom);
  const t = useAtomValue(translationAtom);

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium">
        {t("SETTINGS.OVERWRITE_TOGGLE.TITLE")}
      </p>
      <p className="text-xs text-base-content/80">
        {t("SETTINGS.OVERWRITE_TOGGLE.DESCRIPTION")}
      </p>
      <input
        type="checkbox"
        className="toggle"
        checked={overwrite}
        onClick={() => {
          setOverwrite((oldValue: boolean) => {
            if (oldValue) {
              localStorage.removeItem("overwrite");
              return false;
            } else {
              return true;
            }
          });
          localStorage.setItem("overwrite", JSON.stringify(!overwrite));
        }}
      />
    </div>
  );
};

export default OverwriteToggle;
