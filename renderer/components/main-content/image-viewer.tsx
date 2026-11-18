import { cn } from "@/lib/utils";
import { localFileUrl } from "@/lib/file-url";
import { sanitizePath } from "@common/sanitize-path";
import { useCallback, useState } from "react";

const ImageViewer = ({
  imagePath,
  setDimensions,
  className,
  zoomAmount,
}: {
  imagePath: string;
  setDimensions: (dimensions: { width: number; height: number }) => void;
  className?: string;
  zoomAmount?: string;
}) => {
  const [transformOrigin, setTransformOrigin] = useState("50% 50%");

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLImageElement>) => {
      if (!zoomAmount || Number(zoomAmount) <= 100) return;

      const { left, top, width, height } =
        e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - left) / width) * 100;
      const y = ((e.clientY - top) / height) * 100;
      setTransformOrigin(`${x}% ${y}%`);
    },
    [zoomAmount],
  );

  return (
    <div className="compare-slider-group size-full overflow-hidden">
      <img
        src={localFileUrl(sanitizePath(imagePath))}
        onLoad={(e: React.SyntheticEvent<HTMLImageElement>) => {
          setDimensions({
            width: e.currentTarget.naturalWidth,
            height: e.currentTarget.naturalHeight,
          });
        }}
        onMouseMove={handleMouseMove}
        draggable="false"
        alt=""
        style={{
          transformOrigin,
          ["--zoom-scale" as string]: `${(Number(zoomAmount) || 100) / 100}`,
        }}
        className={cn(
          "slider-zoom size-full bg-background bg-linear-to-br object-contain transition-transform",
          className,
        )}
      />
      <img
        src={localFileUrl(sanitizePath(imagePath))}
        draggable="false"
        alt=""
        className="h-full object-cover"
      />
    </div>
  );
};

export default ImageViewer;
