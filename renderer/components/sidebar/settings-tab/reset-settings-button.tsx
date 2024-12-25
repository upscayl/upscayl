import { translationAtom } from "@/atoms/translations-atom";
import { useAtomValue } from "jotai";
import React from "react";

export function ResetSettingsButton({
  hideLabel = false,
}: {
  hideLabel?: boolean;
}) {
  const t = useAtomValue(translationAtom);
  return (
    <div className="flex flex-col items-start gap-2">
      {!hideLabel && (
        <p className="text-sm font-medium">
          {t("SETTINGS.RESET_SETTINGS.BUTTON_TITLE")}
        </p>
      )}
      <button
        className="btn btn-primary"
        onClick={async () => {
          localStorage.clear();
          alert(t("SETTINGS.RESET_SETTINGS.ALERT"));
        }}
      >
        {t("SETTINGS.RESET_SETTINGS.BUTTON_TITLE")}
      </button>
    </div>
  );
}
