import { translationAtom } from "@/atoms/translations-atom";
import { useAtomValue } from "jotai";
import React from "react";

function InstructionsCard({ version, batchMode }) {
  const t = useAtomValue(translationAtom);

  return (
    <div className="flex flex-col items-center rounded-btn bg-base-200 p-4">
      <p className="pb-1 text-lg font-semibold">
        {batchMode
          ? t("APP.RIGHT_PANE_INFO.SELECT_FOLDER")
          : t("APP.RIGHT_PANE_INFO.SELECT_IMAGE")}
      </p>
      {batchMode ? (
        <p className="w-full pb-5 text-center text-base-content/80 md:w-96">
          {t("APP.RIGHT_PANE_INFO.SELECT_FOLDER_DESCRIPTION")}
        </p>
      ) : (
        <p className="w-full pb-5 text-center text-base-content/80 md:w-96">
          {t("APP.RIGHT_PANE_INFO.SELECT_IMAGES_DESCRIPTION")}
          <br />
          {t("APP.RIGHT_PANE_INFO.PASTE_IMAGE_DESCRIPTION")}
        </p>
      )}
      <p className="badge badge-primary text-sm">Upscayl v{version}</p>
    </div>
  );
}

export default InstructionsCard;
