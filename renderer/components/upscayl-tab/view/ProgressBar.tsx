import React, { CSSProperties, useEffect, useMemo } from "react";
import Spinner from "../../icons/Spinner";
import Logo from "@/components/icons/Logo";

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

  // const progressStyle = useMemo(() => {
  //   if (progress.includes("%")) {
  //     return {
  //       "--value": parseFloat(progress.replace("%", "")),
  //     };
  //   } else if (progress.includes("Success")) {
  //     return {
  //       "--value": 100,
  //     };
  //   }
  //   return {
  //     "--value": 0,
  //   };
  // }, [progress]);

  return (
    <div className="absolute z-50 flex h-full w-full flex-col items-center justify-center bg-base-300/50 backdrop-blur-lg">
      <div className="flex flex-col items-center gap-2 rounded-btn bg-base-100/50 p-4 backdrop-blur-lg">
        <Logo className="spinner h-12 w-12" />
        <p className="rounded-full px-2 pb-2 font-bold">
          {batchMode && `Batch Upscayl In Progress: ${batchProgress}`}
        </p>
        <div className="flex flex-col items-center gap-1">
          {progress !== "Hold on..." ? (
            <p className="text-sm font-bold">
              {progress}
              {!batchMode &&
                doubleUpscaylCounter > 0 &&
                "\nPass " + doubleUpscaylCounter}
            </p>
          ) : (
            <p className="text-sm font-bold">{progress}</p>
          )}
          <p className="animate-pulse rounded-full px-2 pb-3 text-xs font-medium text-neutral-content/50">
            Doing the Upscayl magic...
          </p>
        </div>
        <button onClick={stopHandler} className="btn btn-outline">
          STOP
        </button>
      </div>
    </div>
  );
}

export default ProgressBar;
