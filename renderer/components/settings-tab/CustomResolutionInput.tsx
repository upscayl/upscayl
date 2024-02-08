import { customWidthAtom, useCustomWidthAtom } from "@/atoms/userSettingsAtom";
import { useAtom } from "jotai";
import React, { useState } from "react";

export function CustomResolutionInput() {
  const [useCustomWidth, setUseCustomWidth] = useAtom(useCustomWidthAtom);
  const [customWidth, setCustomWidth] = useAtom(customWidthAtom);

  return (
    <div>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium">CUSTOM OUTPUT WIDTH</p>
        <p className="text-xs text-base-content/80">
          <b>REQUIRES RESTART</b>
          <br />
          Use a custom width for the output images. The height will be adjusted
          automatically. Enabling this will override the scale setting.
        </p>
      </div>
      <div className="flex items-center gap-2">
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
          className="input input-primary mt-2 w-full"
        />
      </div>
    </div>
  );
}
