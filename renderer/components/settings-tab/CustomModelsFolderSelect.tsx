import React from "react";
import commands from "../../../common/commands";
import { useAtomValue } from "jotai";
import { translationAtom } from "@/atoms/translations-atom";

type CustomModelsFolderSelectProps = {
  customModelsPath: string;
  setCustomModelsPath: (arg: string) => void;
};

export function CustomModelsFolderSelect({
  customModelsPath,
  setCustomModelsPath,
}: CustomModelsFolderSelectProps) {
  const t = useAtomValue(translationAtom);

  return (
    <div className="flex flex-col items-start gap-2">
      <p className="text-sm font-medium">{t("APP.INFOS.CUSTOM_MODELS.ADD")}</p>
      <p className="text-xs text-base-content/80">
        {t("APP.INFOS.CUSTOM_MODELS.INFO")}
        <a
          href="https://github.com/upscayl/custom-models/blob/main/README.md"
          className="link underline"
          target="_blank"
        >
          {t("APP.INFOS.CUSTOM_MODELS.LINK_TEXT")}
        </a>
      </p>
      <p className="text-sm text-base-content/60">{customModelsPath}</p>
      <button
        className="btn btn-primary"
        onClick={async () => {
          const customModelPath = await window.electron.invoke(
            commands.SELECT_CUSTOM_MODEL_FOLDER,
          );

          if (customModelPath !== null) {
            setCustomModelsPath(customModelPath);
            window.electron.send(commands.GET_MODELS_LIST, customModelPath);
          } else {
            setCustomModelsPath("");
          }
        }}
      >
        {t("APP.INFOS.CUSTOM_MODELS.SELECT_FOLDER")}
      </button>
    </div>
  );
}
