import { useCustomWidthAtom } from "@/atoms/userSettingsAtom";
import { useAtom } from "jotai";

type ImageScaleSelectProps = {
  scale: "4" | "2" | "3";
  setScale: (arg: "4" | "2" | "3") => void;
};

export function ImageScaleSelect({ scale, setScale }: ImageScaleSelectProps) {
  const [useCustomWidth, setUseCustomWidth] = useAtom(useCustomWidthAtom);

  return (
    <div className={`${useCustomWidth && "opacity-50"}`}>
      <div className="flex flex-row gap-1">
        <p className="text-sm font-medium">
          IMAGE SCALE ({scale}X) {useCustomWidth && "DISABLED"}
        </p>
      </div>
      <p className="text-xs text-base-content/80">
        Anything above 4X (except 16X Double Upscayl) only resizes the image and
        does not use AI upscaling.
      </p>
      {parseInt(scale) >= 6 && (
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
