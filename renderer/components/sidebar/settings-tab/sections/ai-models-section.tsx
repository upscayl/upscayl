import React from "react";
import { useAtom } from "jotai";
import { customModelsPathAtom } from "@/atoms/user-settings-atom";
import { InputGpuId } from "../input-gpu-id";
import { InputTileSize } from "../input-tile-size";
import { CustomModelsFolderSelect } from "../select-custom-models-folder";
import TTAModeToggle from "../tta-mode-toggle";
import { SelectEngine } from "../select-engine";

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
      <InputGpuId gpuId={gpuId} handleGpuIdChange={handleGpuIdChange} />
      <InputTileSize />
      <TTAModeToggle />
      <SelectEngine />
      <CustomModelsFolderSelect
        customModelsPath={customModelsPath}
        setCustomModelsPath={setCustomModelsPath}
      />
    </div>
  );
}

export default AIModelsSection;
