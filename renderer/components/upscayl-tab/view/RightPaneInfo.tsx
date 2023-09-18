import React from "react";

function RightPaneInfo({ version, batchMode }) {
  return (
    <div className="flex flex-col items-center bg-base-200 p-4 rounded-btn">
      <p className="pb-1 text-lg font-semibold">
        Select {batchMode ? "a Folder" : "an Image"} to Upscayl
      </p>
      {batchMode ? (
        <p className="w-full pb-5 text-center md:w-96 text-base-content/80">
          Make sure that the folder doesn't contain anything except PNG, JPG,
          JPEG & WEBP images.
        </p>
      ) : (
        <p className="w-full pb-5 text-center md:w-96 text-base-content/80">
          Select or drag and drop a PNG, JPG, JPEG or WEBP image.
        </p>
      )}
      <p className="text-sm badge badge-primary">Upscayl v{version}</p>
    </div>
  );
}

export default RightPaneInfo;
