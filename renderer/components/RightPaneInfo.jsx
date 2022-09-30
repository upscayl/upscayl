import React from "react";

function RightPaneInfo({ version, batchMode }) {
  return (
    <>
      <p className="p-5 pb-0 text-lg font-medium text-neutral-400">
        Select {batchMode ? "a Folder" : "an Image"} to Upscale
      </p>
      {batchMode && (
        <p className="w-full py-5 text-center text-neutral-500 md:w-96">
          Make sure that the folder doesn't contain anything except PNG, JPG,
          JPEG & WEBP images.
        </p>
      )}
      <p className="text-neutral-600">Upscayl v{version}</p>
    </>
  );
}

export default RightPaneInfo;
