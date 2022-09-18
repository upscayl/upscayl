import React from "react";

function RightPaneInfo({ version, batchMode }) {
  return (
    <>
      <p className="p-5 text-lg font-medium text-neutral-400">
        Select {batchMode ? "a Folder" : "an Image"} to Upscale
      </p>
      <p className="text-neutral-600">Upscayl v{version}</p>
    </>
  );
}

export default RightPaneInfo;
