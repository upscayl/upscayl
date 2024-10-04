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
      onLoad={(e: React.SyntheticEvent<HTMLImageElement>) => {
        setDimensions({
          width: e.currentTarget.naturalWidth,
          height: e.currentTarget.naturalHeight,
        });
      }}
      draggable="false"
      alt=""
      className="h-full w-full bg-gradient-to-br from-base-300 to-base-100 object-contain"
    />
  );
};

export default ImageViewer;
