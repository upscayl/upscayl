import { translationAtom } from "@/atoms/translations-atom";
import { useAtomValue } from "jotai";
import React from "react";

function RightPaneInfo({ version, batchMode }) {
  const t = useAtomValue(translationAtom);

  return (
    <div className="flex flex-col items-center rounded-btn bg-base-200 p-4">
      <p className="pb-1 text-lg font-semibold">
        {batchMode
          ? t("APP.INFOS.RIGHT_PANE_INFO.SELECT_FOLDER")
          : t("APP.INFOS.RIGHT_PANE_INFO.SELECT_IMAGE")}
      </p>
      {batchMode ? (
        <p className="w-full pb-5 text-center text-base-content/80 md:w-96">
          {t("APP.INFOS.RIGHT_PANE_INFO.NOTE_SPECIFIC_FORMATS_IN_FOLDER")}
        </p>
      ) : (
        <p className="w-full pb-5 text-center text-base-content/80 md:w-96">
          {t("APP.INFOS.RIGHT_PANE_INFO.SELECT_IMAGES")}
        </p>
      )}
      <p className="badge badge-primary text-sm">
        {t("APP.INFOS.RIGHT_PANE_INFO.APP_VERSION", { version })}
      </p>
    </div>
  );
}

export default RightPaneInfo;
