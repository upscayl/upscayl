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
      <div data-setting="image-format">
        <SelectImageFormat
          batchMode={batchMode}
          saveImageAs={saveImageAs}
          setExportType={setExportType}
        />
      </div>
      <div data-setting="copy-metadata">
        <CopyMetadataToggle
          saveImageAs={saveImageAs}
          setExportType={setExportType}
        />
      </div>
      <div data-setting="image-scale">
        <SelectImageScale scale={scale} setScale={setScale} />
      </div>
      <div data-setting="custom-resolution">
        <InputCustomResolution />
      </div>
      <div data-setting="compression">
        <InputCompression
          compression={compression}
          handleCompressionChange={handleCompressionChange}
        />
      </div>
      <div data-setting="save-output-folder">
        <SaveOutputFolderToggle />
      </div>
      <HistoryFolderSelect />
      <div data-setting="overwrite">
        <OverwriteToggle />
      </div>
    </div>
  );
}

export default ImageSettingsSection;
