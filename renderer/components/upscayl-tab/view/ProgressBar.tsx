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
    <div className="absolute flex h-full w-full flex-col items-center justify-center bg-base-300/50 backdrop-blur-lg">
      <div className="flex flex-col items-center bg-base-100/50 backdrop-blur-lg p-4 rounded-btn">
        <img
          src="icon.png"
          alt="Upscayl Icon"
          className="w-12 h-12 spinner mb-4"
        />
        <p className="rounded-full px-2 font-bold pb-2">
          {batchMode && "Batch Upscale In Progress: " + batchProgress}

          {!batchMode &&
            (doubleUpscaylCounter > 0
              ? `${progress}\nPass ${doubleUpscaylCounter}`
              : `${progress}`)}
        </p>

        <p className="rounded-full px-2 text-sm font-medium pb-3 animate-pulse">
          Doing the Upscayl magic...
        </p>
        {batchMode && (
          <p className="text-xs rounded-btn text-base-content/70 text-center pb-4 w-64">
            Info: The images will be converted and scaled after the upscaling
            process.
          </p>
        )}
        <button onClick={stopHandler} className="btn-outline btn">
          STOP
        </button>
      </div>
    </div>
  );
}

export default ProgressBar;
