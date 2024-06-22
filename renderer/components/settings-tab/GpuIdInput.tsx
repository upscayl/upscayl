import React from "react";

type GpuIdInputProps = {
  gpuId: string;
  handleGpuIdChange: (arg: string) => void;
};

export function GpuIdInput({ gpuId, handleGpuIdChange }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium ">GPU ID</p>
      <p className="text-xs text-base-content/80">
        Please read the Upscayl Documentation for more information.
      </p>
      {window.electron.platform === "win" && (
        <p className="text-xs text-base-content/80">
          Enable performance mode on Windows for better results.
        </p>
      )}
      <input
        type="text"
        placeholder="Type here"
        className="input input-bordered w-full max-w-xs"
        value={gpuId}
        onChange={handleGpuIdChange}
      />
    </div>
  );
}
