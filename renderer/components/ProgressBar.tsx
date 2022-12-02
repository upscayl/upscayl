import React from "react";
import Animated from "../public/loading.svg";
import Image from "next/image";

function ProgressBar({ progress, doubleUpscaylCounter }) {
  return (
    <div className="absolute flex h-full w-full flex-col items-center justify-center bg-black/50 backdrop-blur-lg">
      <div className="flex flex-col items-center gap-2">
        <Image src={Animated} alt="Progress Bar" />
        <p className="font-bold">
          {doubleUpscaylCounter > 0
            ? `${progress}\nPass ${doubleUpscaylCounter}`
            : `${progress}`}
        </p>
        <p className="text-sm font-medium">Doing the Upscayl magic...</p>
      </div>
    </div>
  );
}

export default ProgressBar;
