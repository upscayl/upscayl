import { translationAtom } from "@/atoms/translations-atom";
import { tileSizeAtom } from "@/atoms/user-settings-atom";
import { useAtom, useAtomValue } from "jotai";
import React from "react";

export function InputTileSize() {
  const [tileSize, setTileSize] = useAtom(tileSizeAtom);
  const t = useAtomValue(translationAtom);

  return (
    <div>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium">
          {t("SETTINGS.CUSTOM_TILE_SIZE.TITLE")}
        </p>
        <p className="text-xs text-base-content/80">
          <br />
          {t("SETTINGS.CUSTOM_TILE_SIZE.DESCRIPTION")}
        </p>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <input
          type="number"
          value={tileSize}
          onChange={(e) => {
            if (e.currentTarget.value === "") {
              setTileSize(null);
              localStorage.removeItem("customWidth");
              return;
            }
            setTileSize(parseInt(e.currentTarget.value));
          }}
          placeholder="0 = Auto"
          className="input input-primary [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
      </div>
    </div>
  );
}
