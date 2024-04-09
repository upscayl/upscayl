import { useCustomWidthAtom } from "@/atoms/userSettingsAtom";
import { useAtom } from "jotai";
import React from "react";

type ImageScaleSelectProps = {
  scale: "4" | "2" | "3";
  setScale: (arg: "4" | "2" | "3") => void;
};

export function ImageScaleSelect({ scale, setScale }: ImageScaleSelectProps) {
  return (
    <div>
      <div className="flex flex-row gap-1">
        <p className="text-sm font-medium">IMAGE SCALE ({scale}X)</p>
        {/* 
        <p className="badge-primary badge text-[10px] font-medium">
          EXPERIMENTAL
        </p> */}
      </div>
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
      <div className="flex w-full justify-between px-2 text-xs font-semibold text-base-content">
        <span>1</span>
        <span>4</span>
        <span>8</span>
        <span>12</span>
        <span>16</span>
      </div>
    </div>
  );
}
