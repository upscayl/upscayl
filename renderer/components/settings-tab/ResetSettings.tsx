import React from "react";

export function ResetSettings() {
  return (
    <div className="flex flex-col items-start gap-2">
      <p className="text-sm font-medium">RESET UPSCAYL</p>
      <button
        className="btn-primary btn"
        onClick={async () => {
          localStorage.clear();
          alert(
            "Upscayl has been reset. Please close this window and open Upscayl again."
          );
        }}>
        RESET UPSCAYL
      </button>
    </div>
  );
}
