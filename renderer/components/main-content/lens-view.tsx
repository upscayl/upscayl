import React, { useRef, useState } from "react";

const LensViewer = ({
  zoomAmount,
  lensSize,
  sanitizedImagePath,
  sanitizedUpscaledImagePath,
}: {
  zoomAmount: string;
  lensSize: number;
  sanitizedImagePath: string;
  sanitizedUpscaledImagePath: string;
}) => {
  const upscaledImageRef = useRef<HTMLImageElement>(null);

  const [lensPosition, setLensPosition] = useState({ x: 0, y: 0 });

  const handleMouseMoveCompare = (e: React.MouseEvent) => {
    if (upscaledImageRef.current) {
      const { left, top, width, height } =
        upscaledImageRef.current.getBoundingClientRect();
      const x = e.clientX - left;
      const y = e.clientY - top;
      setLensPosition({
        x: Math.max(0, Math.min(x - lensSize, width - lensSize * 2)),
        y: Math.max(0, Math.min(y - lensSize / 2, height - lensSize)),
      });
    }
  };

  return (
    <div
      className="group relative h-full w-full overflow-hidden"
      onMouseMove={handleMouseMoveCompare}
    >
      {/* UPSCALED IMAGE */}
      <img
        className="h-full w-full object-contain"
        src={"file:///" + sanitizedUpscaledImagePath}
        alt="Upscaled"
        ref={upscaledImageRef}
      />
      {/* LENS */}
      <div
        className="pointer-events-none absolute opacity-0 transition-opacity before:absolute before:left-1/2 before:h-full before:w-[2px] before:bg-white group-hover:opacity-100"
        style={{
          left: `${lensPosition.x}px`,
          top: `${lensPosition.y}px`,
          width: lensSize * 2,
          height: lensSize,
          border: "2px solid white",
          boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5)",
        }}
      >
        <div className="flex h-full w-full">
          <div className="h-full w-full overflow-hidden">
            <img
              src={"file:///" + sanitizedImagePath}
              alt="Original"
              className="h-full w-full"
              style={{
                objectFit: "contain",
                objectPosition: `${-lensPosition.x}px ${-lensPosition.y}px`,
                transform: `scale(${parseInt(zoomAmount) / 100})`,
                transformOrigin: "top left",
              }}
            />
          </div>
          <div className="h-full w-full overflow-hidden">
            <img
              src={"file:///" + sanitizedUpscaledImagePath}
              alt="Upscaled"
              className="h-full w-full"
              style={{
                objectFit: "contain",
                objectPosition: `${-lensPosition.x}px ${-lensPosition.y}px`,
                transform: `scale(${parseInt(zoomAmount) / 100})`,
                transformOrigin: "top left",
              }}
            />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 flex w-full items-center justify-around bg-black bg-opacity-50 p-1 px-2 text-center text-xs text-white backdrop-blur-sm">
          <span>Original</span>
          <span>Upscayl</span>
        </div>
      </div>
    </div>
  );
};

export default LensViewer;
