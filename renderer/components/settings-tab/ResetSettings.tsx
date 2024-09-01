import { translationAtom } from "@/atoms/translations-atom";
import { useAtomValue } from "jotai";
import React from "react";

export function ResetSettings() {
  const t = useAtomValue(translationAtom);
  return (
    <div className="flex flex-col items-start gap-2">
      <p className="text-sm font-medium">
        {t("APP.INFOS.RESET_SETTINGS.TITLE")}
      </p>
      <button
        className="btn btn-primary"
        onClick={async () => {
          localStorage.clear();
          alert(t("APP.INFOS.RESET_SETTINGS.ON_RESET"));
        }}
      >
        {t("APP.INFOS.RESET_SETTINGS.TITLE")}
      </button>
    </div>
  );
}
