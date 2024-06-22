import { useCustomWidthAtom } from "@/atoms/userSettingsAtom";
import { useAtom, useAtomValue } from "jotai";

type ImageScaleSelectProps = {
  scale: string;
  setScale: React.Dispatch<React.SetStateAction<string>>;
  hideInfo?: boolean;
};

export function ImageScaleSelect({
  scale,
  setScale,
  hideInfo,
}: ImageScaleSelectProps) {
  const useCustomWidth = useAtomValue(useCustomWidthAtom);

  return (
    <div className={`${useCustomWidth && "opacity-50"}`}>
      <div className="flex flex-row gap-1">
        {hideInfo ? (
          <>
            <p className="text-sm ">
              Image Scale <span className="text-xs">({scale}X)</span>
            </p>
            {hideInfo && parseInt(scale) >= 6 && (
              <p
                className="badge badge-warning text-xs font-bold"
                data-tooltip-id="tooltip"
                data-tooltip-content="Anything above 5X may cause performance issues on some devices!"
              >
                !
              </p>
            )}
          </>
        ) : (
          <p className="text-sm font-medium capitalize">
              Image Scale ({scale}X) {useCustomWidth && "DISABLED"}
          </p>
        )}
      </div>
      {!hideInfo && (
        <p className="text-xs text-base-content/80">
          Anything above 4X (except 16X Double Upscayl) only resizes the image
          and does not use AI upscaling.
        </p>
      )}
      {!hideInfo && parseInt(scale) >= 6 && (
        <p className="text-xs text-base-content/80 text-red-500">
          This may cause performance issues on some devices!
        </p>
      )}

      <input
        type="range"
        min="1"
        max="16"
        placeholder="Example: 1320"
        value={scale}
        onChange={(e: any) => {
          setScale(e.target.value.toString());
        }}
        step="1"
        className="range range-primary mt-2"
        disabled={useCustomWidth}
      />
    </div>
  );
}
