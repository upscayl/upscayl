import React from "react";

function RightPaneInfo({ version }) {
  return (
    <>
      <p className="p-5 text-lg font-medium text-neutral-400">
        Select an Image to Upscale
      </p>
      <p className="text-neutral-600">Upscayl v{version}</p>
    </>
  );
}

export default RightPaneInfo;
