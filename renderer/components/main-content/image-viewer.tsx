import React from "react";
import ImageViewSettings from "../upscayl-tab/view/ImageOptions";
import { sanitizePath } from "@common/sanitize-path";

const ImageViewer = ({
  imagePath,
  setDimensions,
}: {
  imagePath: string;
  setDimensions: (dimensions: { width: number; height: number }) => void;
}) => {
  return (
    <img
      src={"file:///" + sanitizePath(imagePath)}
      onLoad={(e: any) => {
        setDimensions({
          width: e.target.naturalWidth,
          height: e.target.naturalHeight,
        });
      }}
      draggable="false"
      alt=""
      className="h-full w-full bg-gradient-to-br from-base-300 to-base-100 object-contain"
    />
  );
};

export default ImageViewer;
