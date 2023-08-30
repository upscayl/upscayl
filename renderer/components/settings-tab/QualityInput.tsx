import React from "react";

type QualityInputProps = {
  quality: number;
  handleQualityChange: (arg: any) => void;
};

export function QualityInput({
  quality,
  handleQualityChange,
}: QualityInputProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1 text-sm font-medium uppercase">
        <p className="shrink-0">Image Compression ({quality}%)</p>
        <p className="badge-primary badge text-[10px] font-medium">
          EXPERIMENTAL
        </p>
      </div>
      <input
        type="range"
        placeholder="Type here"
        className="range range-primary w-full max-w-xs"
        min={0}
        max={100}
        value={quality}
        onChange={handleQualityChange}
      />
    </div>
  );
}
