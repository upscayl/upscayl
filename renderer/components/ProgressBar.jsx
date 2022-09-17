import React from "react";
import Animated from "../public/loading.svg";
import Image from "next/image";

function ProgressBar(props) {
  console.log(props.sharpening);
  return (
    <div className="absolute flex h-full w-full flex-col items-center justify-center bg-black/50 backdrop-blur-lg">
      <div className="flex flex-col items-center gap-2">
        <Image src={Animated} />
        <p className="font-bold text-neutral-50">{props.progress}</p>

        <p className="text-sm font-medium text-neutral-200">
          Doing the Upscayl magic...
        </p>
      </div>
    </div>
  );
}

export default ProgressBar;
