import React from "react";

export function ResetSettings() {
  return (
    <div className="flex flex-col items-start gap-2">
      <p className="text-sm font-medium">Reset Upscayl</p>
      <button
        className="btn btn-primary"
        onClick={async () => {
          localStorage.clear();
          alert("Upscayl has been reset. Please restart the app.");
        }}
      >
          Reset Upscayl
      </button>
    </div>
  );
}
