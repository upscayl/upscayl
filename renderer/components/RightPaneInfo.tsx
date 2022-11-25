import React from "react";

function RightPaneInfo({ version, batchMode, isVideo }) {
  return isVideo ? (
    <>
      <p className="p-5 pb-1 text-lg font-semibold">Select Video to Upscale</p>
      <p className="text-sm">Upscayl v{version}</p>
    </>
  ) : (
    <>
      <p className="p-5 pb-1 text-lg font-semibold">
        Select {batchMode ? "a Folder" : "an Image"} to Upscale
      </p>
      {batchMode && (
        <p className="w-full pb-5 text-center md:w-96">
          Make sure that the folder doesn't contain anything except PNG, JPG,
          JPEG & WEBP images.
        </p>
      )}
      <p className="text-sm">Upscayl v{version}</p>
    </>
  );
}

export default RightPaneInfo;
