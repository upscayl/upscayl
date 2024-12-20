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
    relativeMouseX: 0, // To show the lens horizontally within the image
    mouseY: 0, // To show the lens vertically in the viewport
    relativeMouseXPercent: 0,
    relativeMouseYPercent: 0,
    originalImageMouseX: 0,
    originalImageMouseY: 0,
  });
  const zoomLevel = 4;

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!originalImageRef.current || !originalImageContainerRef.current) return;

    const containerRect =
      originalImageContainerRef.current.getBoundingClientRect();

    // Image w-h is actually equal to container w-h, even in object-fit: contain
    let viewportImageWidth = originalImageRef.current.width;
    let viewportImageHeight = originalImageRef.current.height;
    let imageTop = 0;
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    const containerHeight = containerRect.height;
    const containerLeft = containerRect.left; // Since sidebar pushes the container to the right
    const containerTop = containerRect.top;

    // Image is width-constrained
    const originalImageAspectRatio =
      originalImageRef.current.naturalWidth /
      originalImageRef.current.naturalHeight;
    viewportImageHeight = viewportImageWidth / originalImageAspectRatio;
    // Divide by 2 because image is centered
    imageTop = (containerHeight - viewportImageHeight) / 2;

    // Find relative mouse position within the image
    const relativeMouseX = mouseX - containerLeft;
    const relativeMouseY = mouseY - imageTop;

    // Check if the mouse is within the actual image boundaries
    const isWithinImage =
      relativeMouseX >= 0 &&
      relativeMouseX <= viewportImageWidth &&
      relativeMouseY >= 0 &&
      relativeMouseY <= viewportImageHeight;

    if (!isWithinImage) {
      // Hide the lens if the mouse is outside the image
      setHoverPosition({
        relativeMouseXPercent: -1000,
        relativeMouseYPercent: -1000,
        relativeMouseX: -1000,
        mouseY: -1000,
        originalImageMouseX: -1000,
        originalImageMouseY: -1000,
      });
      return;
    }

    // Find image-relative mouse position as percentage
    const relativeMouseXPercent = (relativeMouseX / viewportImageWidth) * 100;
    const relativeMouseYPercent = (relativeMouseY / viewportImageHeight) * 100;

    // Find the pixel position within the image relative to the original image
    const bgPosX =
      (relativeMouseX / viewportImageWidth) *
      originalImageRef.current.naturalWidth;
    const bgPosY =
      (relativeMouseY / viewportImageHeight) *
      originalImageRef.current.naturalHeight;

    setHoverPosition({
      relativeMouseXPercent,
      relativeMouseYPercent,
      relativeMouseX,
      mouseY,
      originalImageMouseX: bgPosX,
      originalImageMouseY: bgPosY,
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
        ORIGINAL IMAGE
        <img
          src={originalImage}
          alt="Original"
          className="h-full w-full object-contain"
          onMouseMove={handleMouseMove}
          ref={originalImageRef}
        />
        {/* Lens */}
        <div
          className="pointer-events-none absolute hidden cursor-cell border border-primary bg-black/10 group-hover:block"
          style={{
            left: `${hoverPosition.relativeMouseX}px`,
            top: `${hoverPosition.mouseY}px`,
            transform: "translate(-50%, -50%)",
            height: `48px`,
            width: `48px`,
          }}
        />
      </div>

      {/* Enlarged views for original and upscaled images */}
      <div
        className="pointer-events-none absolute hidden group-hover:flex"
        style={{
          left: `${hoverPosition.relativeMouseX}px`,
          top: `${hoverPosition.mouseY + 25}px`,
          transform: "translate(-50%, 0)",
        }}
      >
        {/* ORIGINAL IMAGE */}
        <div
          className="relative h-48 w-48 border border-gray-300 bg-cover bg-no-repeat"
          style={{
            backgroundImage: `url(${originalImage})`,
            backgroundPosition: `-${hoverPosition.originalImageMouseX * zoomLevel - 96}px -${hoverPosition.originalImageMouseY * zoomLevel - 96}px`,
            backgroundSize: `${originalImageRef.current?.naturalWidth * zoomLevel}px ${originalImageRef.current?.naturalHeight * zoomLevel}px`,
          }}
        >
          <span className="absolute bottom-0 w-full bg-black bg-opacity-60 px-2 py-1 text-center text-xs text-white">
            Original
          </span>
        </div>
        {/* UPSCALED IMAGE */}
        <div
          className="relative h-48 w-48 border border-gray-300 bg-cover bg-no-repeat"
          style={{
            backgroundImage: `url(${upscaledImage})`,
            backgroundPosition: `-${hoverPosition.originalImageMouseX * zoomLevel - 96}px -${hoverPosition.originalImageMouseY * zoomLevel - 96}px`,
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
