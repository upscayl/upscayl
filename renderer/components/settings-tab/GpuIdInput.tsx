import { translationAtom } from "@/atoms/translations-atom";
import { useAtomValue } from "jotai";
import React from "react";

type GpuIdInputProps = {
  gpuId: string;
  handleGpuIdChange: (arg: string) => void;
};

export function GpuIdInput({ gpuId, handleGpuIdChange }) {
  const t = useAtomValue(translationAtom);

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium">{t("APP.INFOS.GPU_ID_INPUT.ID")}</p>
      <p className="text-xs text-base-content/80">
        {t("APP.INFOS.GPU_ID_INPUT.READ_DOCS")}
      </p>
      {window.electron.platform === "win" && (
        <p className="text-xs text-base-content/80">
          {t("APP.INFOS.GPU_ID_INPUT.ENABLE_PERF_MODE")}
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
