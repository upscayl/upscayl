import React from "react";

type GpuIdInputProps = {
  gpuId: string;
  handleGpuIdChange: (arg: string) => void;
};

export function GpuIdInput({ gpuId, handleGpuIdChange }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium">GPU ID</p>
      {window.electron.platform === "win" && (
        <p className="text-xs text-base-content/80">
          Please enable performance mode on Windows for better results. Please
          read the Upscayl Wiki for more information.
        </p>
      )}
      <input
        type="text"
        placeholder="Type here"
        className="input-bordered input w-full max-w-xs"
        value={gpuId}
        onChange={handleGpuIdChange}
      />
    </div>
  );
}
