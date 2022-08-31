import React from "react";

function ProgressBar(props) {
  return (
    <div className="absolute flex h-full w-full flex-col items-center justify-center bg-black/50 backdrop-blur-lg">
      <div className="flex flex-col items-center gap-2">
        <Image src={Animated} />
        <p className="font-bold text-neutral-50">{props.progress}</p>
      </div>
    </div>
  );
}

export default ProgressBar;
