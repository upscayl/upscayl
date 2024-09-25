import { translationAtom } from "@/atoms/translations-atom";
import { useAtomValue } from "jotai";
import React from "react";

type GpuIdInputProps = {
  gpuId: string;
  handleGpuIdChange: (arg: string) => void;
};

export function InputGpuId({ gpuId, handleGpuIdChange }) {
  const t = useAtomValue(translationAtom);

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium">{t("SETTINGS.GPU_ID_INPUT.TITLE")}</p>
      <p className="text-xs text-base-content/80">
        {t("SETTINGS.GPU_ID_INPUT.DESCRIPTION")}
      </p>
      {window.electron.platform === "win" && (
        <p className="text-xs text-base-content/80">
          {t("SETTINGS.GPU_ID_INPUT.ADDITIONAL_DESCRIPTION")}
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
