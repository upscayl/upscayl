import React, { useMemo, useRef, useState } from "react";

const LensViewer = ({
  sanitizedImagePath,
  sanitizedUpscaledImagePath,
}: {
  sanitizedImagePath: string;
  sanitizedUpscaledImagePath: string;
}) => {
  const originalImageContainerRef = useRef<HTMLDivElement>(null);
  const originalImageRef = useRef<HTMLImageElement>(null);

  const [hoverPosition, setHoverPosition] = useState({
    x: 0,
    y: 0,
    pixelX: 0,
    pixelY: 0,
    bgPosX: 0,
    bgPosY: 0,
  });
  const zoomLevel = 4;

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!originalImageRef.current || !originalImageContainerRef.current) return;

    const containerRect =
      originalImageContainerRef.current.getBoundingClientRect();

    const imageAspectRatio =
      originalImageRef.current.naturalWidth /
      originalImageRef.current.naturalHeight;
    const containerAspectRatio = containerRect.width / containerRect.height;

    let imageWidth = containerRect.width;
    let imageHeight = containerRect.height;
    let imageLeft = 0;
    let imageTop = 0;

    if (containerAspectRatio > imageAspectRatio) {
      // Image is height-constrained
      imageWidth = imageHeight * imageAspectRatio;
      imageLeft = (containerRect.width - imageWidth) / 2;
    } else {
      // Image is width-constrained
      imageHeight = imageWidth / imageAspectRatio;
      imageTop = (containerRect.height - imageHeight) / 2;
    }

    const offsetX = e.clientX - containerRect.left - imageLeft;
    const offsetY = e.clientY - containerRect.top - imageTop;

    // Check if the mouse is within the actual image boundaries
    const isWithinImage =
      offsetX >= 0 &&
      offsetX <= imageWidth &&
      offsetY >= 0 &&
      offsetY <= imageHeight;

    if (!isWithinImage) {
      setHoverPosition({
        x: -1000,
        y: -1000,
        pixelX: -1000,
        pixelY: -1000,
        bgPosX: -1000,
        bgPosY: -1000,
      }); // Move lens off-screen
      return;
    }

    const x = (offsetX / imageWidth) * 100;
    const y = (offsetY / imageHeight) * 100;

    // Calculate background position for zoom view
    const bgPosX =
      (offsetX / imageWidth) * originalImageRef.current.naturalWidth;
    const bgPosY =
      (offsetY / imageHeight) * originalImageRef.current.naturalHeight;

    setHoverPosition({
      x,
      y,
      pixelX: e.clientX - containerRect.left,
      pixelY: e.clientY - containerRect.top,
      bgPosX,
      bgPosY,
    });
  };

  const originalImage = useMemo(
    () => "file:///" + sanitizedImagePath,
    [sanitizedImagePath],
  );
  const upscaledImage = useMemo(
    () => "file:///" + sanitizedUpscaledImagePath,
    [sanitizedUpscaledImagePath],
  );

  return (
    <div className="group relative flex h-full flex-col items-center">
      {/* Main image container */}
      <div
        className="relative h-full w-full cursor-crosshair"
        ref={originalImageContainerRef}
      >
        <img
          src={originalImage}
          alt="Original"
          className="h-full w-full object-contain"
          onMouseMove={handleMouseMove}
          ref={originalImageRef}
        />
        <div
          className="pointer-events-none absolute hidden h-10 w-10 cursor-cell border border-primary bg-black/10 group-hover:block"
          style={{
            left: `${hoverPosition.pixelX}px`,
            top: `${hoverPosition.pixelY}px`,
            transform: "translate(-50%, -50%)",
          }}
        />
      </div>

      {/* Enlarged views for original and upscaled images */}
      <div
        className="pointer-events-none absolute hidden group-hover:flex"
        style={{
          left: `${hoverPosition.pixelX}px`,
          top: `${hoverPosition.pixelY + 25}px`,
          transform: "translate(-50%, 0)",
        }}
      >
        <div
          className="relative h-48 w-48 border border-gray-300 bg-cover bg-no-repeat"
          style={{
            backgroundImage: `url(${originalImage})`,
            backgroundPosition: `-${hoverPosition.bgPosX * zoomLevel - 96}px -${hoverPosition.bgPosY * zoomLevel - 96}px`,
            backgroundSize: `${originalImageRef.current?.naturalWidth * zoomLevel}px ${originalImageRef.current?.naturalHeight * zoomLevel}px`,
          }}
        >
          <span className="absolute bottom-0 w-full bg-black bg-opacity-60 px-2 py-1 text-center text-xs text-white">
            Original
          </span>
        </div>
        <div
          className="relative h-48 w-48 border border-gray-300 bg-cover bg-no-repeat"
          style={{
            backgroundImage: `url(${upscaledImage})`,
            backgroundPosition: `-${hoverPosition.bgPosX * zoomLevel - 96}px -${hoverPosition.bgPosY * zoomLevel - 96}px`,
            backgroundSize: `${originalImageRef.current?.naturalWidth * zoomLevel}px ${originalImageRef.current?.naturalHeight * zoomLevel}px`,
          }}
        >
          <span className="absolute bottom-0 w-full bg-black bg-opacity-60 px-2 py-1 text-center text-xs text-white">
            Upscayl AI
          </span>
        </div>
      </div>
    </div>
  );
};

export default LensViewer;
