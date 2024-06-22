import React from "react";
import commands from "../../../common/commands";

type CustomModelsFolderSelectProps = {
  customModelsPath: string;
  setCustomModelsPath: (arg: string) => void;
};

export function CustomModelsFolderSelect({
  customModelsPath,
  setCustomModelsPath,
}: CustomModelsFolderSelectProps) {
  return (
    <div className="flex flex-col items-start gap-2">
      <p className="text-sm font-medium">Add Custom Models</p>
      <p className="text-xs text-base-content/80">
        You can add your own models easily. For more details:{" "}
        <a
          href="https://github.com/upscayl/custom-models/blob/main/README.md"
          className="underline link"
          target="_blank">
          Custom Models Repository
        </a>
      </p>
      <p className="text-sm text-base-content/60">{customModelsPath}</p>
      <button
        className="btn-primary btn"
        onClick={async () => {
          const customModelPath = await window.electron.invoke(
            commands.SELECT_CUSTOM_MODEL_FOLDER
          );

          if (customModelPath !== null) {
            setCustomModelsPath(customModelPath);
            window.electron.send(commands.GET_MODELS_LIST, customModelPath);
          } else {
            setCustomModelsPath("");
          }
        }}>
        Select Folder
      </button>
    </div>
  );
}
