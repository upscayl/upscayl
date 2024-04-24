import { tileSizeAtom } from "@/atoms/userSettingsAtom";
import { useAtom } from "jotai";
import React from "react";

export function TileSizeInput() {
  const [tileSize, setTileSize] = useAtom(tileSizeAtom);

  return (
    <div>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium">CUSTOM TILE SIZE</p>
        <p className="text-xs text-base-content/80">
          <br />
          Use a custom tile size for segmenting the image. This can help process
          images faster by reducing the number of tiles generated.
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
