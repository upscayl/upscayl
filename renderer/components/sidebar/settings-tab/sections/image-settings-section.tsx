import React from "react";
import { useAtom } from "jotai";
import { scaleAtom } from "@/atoms/user-settings-atom";
import { SelectImageFormat } from "../select-image-format";
import CopyMetadataToggle from "../copy-metadata-toggle";
import { SelectImageScale } from "../select-image-scale";
import { InputCustomResolution } from "../input-custom-resolution";
import { InputCompression } from "../input-compression";
import { SaveOutputFolderToggle } from "../save-output-folder-toggle";
import { HistoryFolderSelect } from "../select-history-folder";
import OverwriteToggle from "../overwrite-toggle";
import { ImageFormat } from "@/lib/valid-formats";

interface IProps {
  batchMode: boolean;
  saveImageAs: ImageFormat;
  setSaveImageAs: React.Dispatch<React.SetStateAction<ImageFormat>>;
  compression: number;
  setCompression: React.Dispatch<React.SetStateAction<number>>;
}

function ImageSettingsSection({
  batchMode,
  saveImageAs,
  setSaveImageAs,
  compression,
  setCompression,
}: IProps) {
  const [scale, setScale] = useAtom(scaleAtom);

  const setExportType = (format: ImageFormat) => {
    setSaveImageAs(format);
  };

  const handleCompressionChange = (value: number) => {
    setCompression(value);
  };

  return (
    <div className="flex flex-col gap-5">
      <SelectImageFormat
        batchMode={batchMode}
        saveImageAs={saveImageAs}
        setExportType={setExportType}
      />
      <CopyMetadataToggle
        saveImageAs={saveImageAs}
        setExportType={setExportType}
      />
      <SelectImageScale scale={scale} setScale={setScale} />
      <InputCustomResolution />
      <InputCompression
        compression={compression}
        handleCompressionChange={handleCompressionChange}
      />
      <SaveOutputFolderToggle />
      <HistoryFolderSelect />
      <OverwriteToggle />
    </div>
  );
}

export default ImageSettingsSection;
