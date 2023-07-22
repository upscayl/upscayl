import React from "react";

type SaveOutputFolderToggleProps = {
  rememberOutputFolder: boolean;
  setRememberOutputFolder: (arg: any) => void;
};

export function SaveOutputFolderToggle({
  rememberOutputFolder,
  setRememberOutputFolder,
}: SaveOutputFolderToggleProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium">SAVE OUTPUT FOLDER (PERMANENTLY)</p>
      <input
        type="checkbox"
        className="toggle-primary toggle"
        checked={rememberOutputFolder}
        onClick={() => {
          setRememberOutputFolder((oldValue) => {
            if (oldValue === true) {
              localStorage.removeItem("lastOutputFolderPath");
            }
            return !oldValue;
          });
          localStorage.setItem(
            "rememberOutputFolder",
            JSON.stringify(!rememberOutputFolder)
          );
        }}
      />
    </div>
  );
}
