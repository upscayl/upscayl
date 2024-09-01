import { customWidthAtom, useCustomWidthAtom } from "@/atoms/userSettingsAtom";
import { useAtom, useAtomValue } from "jotai";
import React from "react";
import { translationAtom } from "@/atoms/translations-atom";

export function CustomResolutionInput() {
  const [useCustomWidth, setUseCustomWidth] = useAtom(useCustomWidthAtom);
  const [customWidth, setCustomWidth] = useAtom(customWidthAtom);
  const t = useAtomValue(translationAtom);

  return (
    <div>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium">
          {t("APP.INFOS.CUSTOM_INPUT_RESOLUTION.WIDTH")}
        </p>
        <p className="text-xs text-base-content/80">
          <b>{t("APP.INFOS.CUSTOM_INPUT_RESOLUTION.RESTART")}</b>
          <br />
          {t("APP.INFOS.CUSTOM_INPUT_RESOLUTION.CUSTOM_WIDTH_TIP")}
        </p>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <input
          type="checkbox"
          className="toggle"
          checked={useCustomWidth}
          onClick={(e) => {
            if (!e.currentTarget.checked) {
              localStorage.removeItem("customWidth");
            }
            setUseCustomWidth(!useCustomWidth);
          }}
        />
        <input
          type="number"
          value={customWidth}
          disabled={!useCustomWidth}
          onChange={(e) => {
            if (e.currentTarget.value === "") {
              setUseCustomWidth(false);
              setCustomWidth(null);
              localStorage.removeItem("customWidth");
              return;
            }
            setCustomWidth(parseInt(e.currentTarget.value));
          }}
          step="1"
          min="1"
          className="input input-primary h-7 w-32 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
      </div>
    </div>
  );
}
