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
      <p className="text-sm font-medium uppercase">
        Image Compression ({quality}%)
      </p>
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
