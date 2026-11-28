import React from "react";
import { useAtom } from "jotai";
import { customModelsPathAtom } from "@/atoms/user-settings-atom";
import { InputGpuId } from "../input-gpu-id";
import { InputTileSize } from "../input-tile-size";
import { CustomModelsFolderSelect } from "../select-custom-models-folder";
import TTAModeToggle from "../tta-mode-toggle";

interface IProps {
  gpuId: string;
  setGpuId: React.Dispatch<React.SetStateAction<string>>;
}

function AIModelsSection({ gpuId, setGpuId }: IProps) {
  const [customModelsPath, setCustomModelsPath] = useAtom(customModelsPathAtom);

  const handleGpuIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGpuId(e.target.value);
    localStorage.setItem("gpuId", e.target.value);
  };

  return (
    <div className="flex flex-col gap-5">
      <div data-setting="gpu-id">
        <InputGpuId gpuId={gpuId} handleGpuIdChange={handleGpuIdChange} />
      </div>
      <div data-setting="tile-size">
        <InputTileSize />
      </div>
      <div data-setting="tta-mode">
        <TTAModeToggle />
      </div>
      <div data-setting="custom-models-folder">
        <CustomModelsFolderSelect
          customModelsPath={customModelsPath}
          setCustomModelsPath={setCustomModelsPath}
        />
      </div>
    </div>
  );
}

export default AIModelsSection;
