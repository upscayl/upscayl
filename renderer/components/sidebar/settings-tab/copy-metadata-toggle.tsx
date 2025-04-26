import React, { useState } from "react";
import { translationAtom } from "@/atoms/translations-atom";
import { copyMetadataAtom } from "@/atoms/user-settings-atom";
import { useAtom, useAtomValue } from "jotai";

type CopyMetadataToggleProps = {
  saveImageAs: string;
  setExportType: (type: string) => void;
};

const CopyMetadataToggle = ({ saveImageAs, setExportType }: CopyMetadataToggleProps) => {
  const [copyMetadata, setCopyMetadata] = useAtom(copyMetadataAtom);
  const t = useAtomValue(translationAtom);
  const [showSuggestModal, setShowSuggestModal] = useState(false);

  const handleToggle = () => {
    if (!copyMetadata && saveImageAs !== "jpg" && setExportType) {
      setShowSuggestModal(true);
    } else {
      setCopyMetadata(!copyMetadata);
      localStorage.setItem("copyMetadata", JSON.stringify(!copyMetadata));
    }
  };

  const handleChangeToJpg = () => {
    setShowSuggestModal(false);
    setCopyMetadata(true);
    localStorage.setItem("copyMetadata", "true");
    setExportType("jpg");
  };

  const handleKeepFormat = () => {
    setShowSuggestModal(false);
    setCopyMetadata(true);
    localStorage.setItem("copyMetadata", "true");
  };

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium">
        {t("SETTINGS.COPY_METADATA.TITLE")}
      </p>
      <p className="text-xs text-base-content/80">
        {t("SETTINGS.COPY_METADATA.DESCRIPTION")}
      </p>
      <input
        type="checkbox"
        className="toggle"
        checked={copyMetadata}
        onChange={handleToggle}
      />
      {copyMetadata && saveImageAs !== "jpg" && (
        <p className="text-xs text-warning">
          {t("WARNING.METADATA_FORMAT.DESCRIPTION")}
        </p>
      )}
      
      {showSuggestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-96 rounded-lg bg-base-100 p-6 shadow-xl">
            <h3 className="mb-2 text-lg font-semibold">
              {t("SETTINGS.COPY_METADATA.SUGGEST_JPG_TITLE")}
            </h3>
            <p className="mb-4 text-sm text-base-content/80">
              {t("SETTINGS.COPY_METADATA.SUGGEST_JPG_DESCRIPTION")}
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="btn btn-primary"
                onClick={handleChangeToJpg}
              >
                {t("SETTINGS.COPY_METADATA.CHANGE_TO_JPG")}
              </button>
              <button
                className="btn"
                onClick={handleKeepFormat}
              >
                {t("SETTINGS.COPY_METADATA.KEEP_CURRENT_FORMAT").replace("{format}", saveImageAs.toUpperCase())}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CopyMetadataToggle;