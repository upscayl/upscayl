import React from "react";

type ToggleOverwriteProps = {
  overwrite: boolean;
  setOverwrite: (arg: any) => void;
};

const ToggleOverwrite = ({ overwrite, setOverwrite }: ToggleOverwriteProps) => {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium">OVERWRITE PREVIOUS UPSCALE</p>
      <input
        type="checkbox"
        className="toggle-primary toggle"
        checked={overwrite}
        onClick={() => {
          setOverwrite((oldValue) => {
            if (oldValue === true) {
              localStorage.removeItem("overwrite");
            }
            return !oldValue;
          });
          localStorage.setItem("overwrite", JSON.stringify(!overwrite));
        }}
      />
    </div>
  );
};

export default ToggleOverwrite;
