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
    console.log(
      "🚀 => file: ProgressBar.tsx:19 => progressString:",
      progressString
    );

    // Remove trailing and leading spaces
    if (progressString.includes("Successful")) {
      setBatchProgress((prev) => prev + 1);
    }
  }, [progress]);

  console.log({
    progress,
  });

  return (
    <div className="absolute flex h-full w-full flex-col items-center justify-center bg-base-300/50 backdrop-blur-lg">
      <div className="flex flex-col items-center gap-2">
        <Spinner />
        <p className="rounded-full bg-base-300 px-2 py-1 font-bold">
          {batchMode && "Batch Upscale In Progress: " + batchProgress}
          {!batchMode &&
            (doubleUpscaylCounter > 0
              ? `${progress}\nPass ${doubleUpscaylCounter}`
              : `${progress}`)}
        </p>
        <p className="rounded-full bg-base-300 px-2 py-1 text-sm font-medium">
          Doing the Upscayl magic...
        </p>
        <button onClick={stopHandler} className="btn-danger btn">
          STOP
        </button>
      </div>
    </div>
  );
}

export default ProgressBar;
