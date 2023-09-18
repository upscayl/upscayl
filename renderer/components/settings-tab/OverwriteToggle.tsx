import React, { useEffect } from "react";

type OverwriteToggleProps = {
  overwrite: boolean;
  setOverwrite: (arg: any) => void;
};

const OverwriteToggle = ({ overwrite, setOverwrite }: OverwriteToggleProps) => {
  useEffect(() => {
    if (!localStorage.getItem("overwrite")) {
      localStorage.setItem("overwrite", JSON.stringify(overwrite));
    } else {
      const currentlySavedOverwrite = localStorage.getItem("overwrite");
      if (currentlySavedOverwrite) {
        setOverwrite(currentlySavedOverwrite === "true");
      }
    }
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium">OVERWRITE PREVIOUS UPSCALE</p>
      <p className="text-xs text-base-content/80">
        If enabled, Upscayl will process the image again instead of loading it
        directly.
      </p>
      <input
        type="checkbox"
        className="toggle"
        checked={overwrite}
        onClick={() => {
          setOverwrite((oldValue: boolean) => {
            if (oldValue) {
              localStorage.removeItem("overwrite");
              return false;
            } else {
              return true;
            }
          });
          localStorage.setItem("overwrite", JSON.stringify(!overwrite));
        }}
      />
    </div>
  );
};

export default OverwriteToggle;
