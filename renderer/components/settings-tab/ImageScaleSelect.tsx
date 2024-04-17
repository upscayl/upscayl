type ImageScaleSelectProps = {
  scale: "4" | "2" | "3";
  setScale: (arg: "4" | "2" | "3") => void;
};

export function ImageScaleSelect({ scale, setScale }: ImageScaleSelectProps) {
  return (
    <div>
      <div className="flex flex-row gap-1">
        <p className="text-sm font-medium">IMAGE SCALE ({scale}X)</p>
      </div>
      <p className="text-xs text-base-content/80">
        Anything above 4X (except 16X Double Upscayl) only resizes the image and
        does not use AI upscaling.
      </p>
      <input
        type="range"
        min="1"
        max="16"
        value={scale}
        onChange={(e: any) => {
          setScale(e.target.value.toString());
        }}
        step="1"
        className="range range-primary mt-2"
      />
      {/* <div className="flex w-full justify-between px-2 text-xs font-semibold text-base-content">
        <span>1</span>
        <span>4</span>
        <span>8</span>
        <span>12</span>
        <span>16</span>
      </div> */}
    </div>
  );
}
