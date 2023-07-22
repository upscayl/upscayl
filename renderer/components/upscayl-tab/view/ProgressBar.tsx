import React from "react";
import Spinner from "../../icons/Spinner";

function ProgressBar({ progress, doubleUpscaylCounter, stopHandler }) {
  return (
    <div className="absolute flex h-full w-full flex-col items-center justify-center bg-base-300/50 backdrop-blur-lg">
      <div className="flex flex-col items-center gap-2">
        <Spinner />
        <p className="rounded-full bg-base-300 px-2 py-1 font-bold">
          {doubleUpscaylCounter > 0
            ? `${progress}\nPass ${doubleUpscaylCounter}`
            : `${progress}`}
        </p>
        <p className="rounded-full bg-base-300 px-2 py-1 text-sm font-medium">
          Doing the Upscayl magic...
        </p>
        <button onClick={stopHandler} className="btn-primary btn">
          STOP
        </button>
      </div>
    </div>
  );
}

export default ProgressBar;
