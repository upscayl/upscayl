import React from "react";

type ImageScaleSelectProps = {
  scale: "4" | "2" | "3";
  setScale: (arg: "4" | "2" | "3") => void;
};

export function ImageScaleSelect({ scale, setScale }: ImageScaleSelectProps) {
  return (
    <div>
      <div className="flex flex-row gap-1">
        <p className="text-sm font-medium">IMAGE SCALE</p>
        <a
          href="https://github.com/upscayl/upscayl/wiki/Guide#scale-option"
          target="_blank">
          <p className="badge-primary badge text-[10px] font-medium">
            EXPERIMENTAL
          </p>
        </a>
      </div>
      <input
        type="range"
        min="1"
        max="4"
        value={scale}
        onChange={(e: any) => {
          setScale(e.target.value.toString());
        }}
        step="1"
        className="range range-primary mt-2"
      />
      <div className="flex w-full justify-between px-2 text-xs font-semibold text-base-content">
        <span>1x</span>
        <span>2x</span>
        <span>3x</span>
        <span>4x</span>
      </div>
    </div>
  );
}
