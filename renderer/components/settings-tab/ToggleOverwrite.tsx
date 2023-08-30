import React, { useEffect } from "react";

type ToggleOverwriteProps = {
  overwrite: boolean;
  setOverwrite: (arg: any) => void;
};

const ToggleOverwrite = ({ overwrite, setOverwrite }: ToggleOverwriteProps) => {
  useEffect(() => {
    if (!localStorage.getItem("overwrite")) {
      localStorage.setItem("overwrite", JSON.stringify(overwrite));
    } else {
      const currentlySavedOverwrite = localStorage.getItem("overwrite");
      if (currentlySavedOverwrite) {
        setOverwrite(JSON.parse(currentlySavedOverwrite));
      }
    }
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium">OVERWRITE PREVIOUS UPSCALE</p>
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

export default ToggleOverwrite;
