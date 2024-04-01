import React, { useEffect } from "react";
import Spinner from "../../icons/Spinner";

function ProgressBar({
  progress,
  doubleUpscaylCounter,
  stopHandler,
  batchMode,
}: {
  progress: string;
  doubleUpscaylCounter: number;
  stopHandler: () => void;
  batchMode: boolean;
}) {
  const [batchProgress, setBatchProgress] = React.useState(0);

  useEffect(() => {
    const progressString = progress.trim().replace(/\n/g, "");
    // Remove trailing and leading spaces
    if (progressString.includes("Successful")) {
      setBatchProgress((prev) => prev + 1);
    }
  }, [progress]);

  return (
    <div className="absolute z-50 flex h-full w-full flex-col items-center justify-center bg-base-300/50 backdrop-blur-lg">
      <div className="rounded-btn flex flex-col items-center bg-base-100/50 p-4 backdrop-blur-lg">
        <img
          src="icon.png"
          alt="Upscayl Icon"
          className="spinner mb-4 h-12 w-12"
        />
        <p className="rounded-full px-2 pb-2 font-bold">
          {batchMode && "Batch Upscale In Progress: " + batchProgress}

          {!batchMode &&
            (doubleUpscaylCounter > 0
              ? `${progress}\nPass ${doubleUpscaylCounter}`
              : `${progress}`)}
        </p>

        <p className="animate-pulse rounded-full px-2 pb-3 text-sm font-medium">
          Doing the Upscayl magic...
        </p>
        {batchMode && (
          <p className="rounded-btn w-64 pb-4 text-center text-xs text-base-content/70">
            Info: The images will be converted and scaled after the upscaling
            process.
          </p>
        )}
        <button onClick={stopHandler} className="btn btn-outline">
          STOP
        </button>
      </div>
    </div>
  );
}

export default ProgressBar;
