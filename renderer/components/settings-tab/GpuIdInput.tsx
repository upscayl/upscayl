import React from "react";

type GpuIdInputProps = {
  gpuId: string;
  handleGpuIdChange: (arg: string) => void;
};

export function GpuIdInput({ gpuId, handleGpuIdChange }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium">GPU ID</p>
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
