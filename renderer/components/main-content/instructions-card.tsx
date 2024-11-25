import { translationAtom } from "@/atoms/translations-atom";
import { useAtomValue } from "jotai";
import React from "react";

function InstructionsCard({ version, batchMode }) {
  const t = useAtomValue(translationAtom);

  return (
    <div className="flex flex-col items-center gap-4 rounded-btn bg-base-200 p-4">
      <p className="text-lg font-semibold">
        {batchMode
          ? t("APP.RIGHT_PANE_INFO.SELECT_FOLDER")
          : t("APP.RIGHT_PANE_INFO.SELECT_IMAGE")}
      </p>
      {batchMode ? (
        <p className="w-full text-center text-base-content/80 md:w-96">
          {t("APP.RIGHT_PANE_INFO.SELECT_FOLDER_DESCRIPTION")}
        </p>
      ) : (
        <div className="flex flex-col gap-1 text-center text-sm text-base-content/70">
          <p>{t("APP.RIGHT_PANE_INFO.SELECT_IMAGES_DESCRIPTION")}</p>
          <p>{t("APP.RIGHT_PANE_INFO.PASTE_IMAGE_DESCRIPTION")}</p>
        </div>
      )}
      <p className="badge badge-primary text-sm">Upscayl v{version}</p>
    </div>
  );
}

export default InstructionsCard;
