import React, { useRef, useState } from "react";

const LensImage = ({
  src,
  alt,
  lensPosition,
  zoomAmount,
}: {
  src: string;
  alt: string;
  lensPosition: { x: number; y: number };
  zoomAmount: number;
}) => (
  <div className="h-full w-full overflow-hidden">
    <img
      src={src}
      alt={alt}
      className="h-full w-full"
      style={{
        objectFit: "contain",
        objectPosition: `${-lensPosition.x}px ${-lensPosition.y}px`,
        transform: `scale(${zoomAmount / 100})`,
        transformOrigin: "top left",
      }}
    />
  </div>
);

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
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e) => {
    const { left, top, width, height } =
      e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    setHoverPosition({ x, y });
  };

  const handleMouseEnter = () => setIsHovering(true);
  const handleMouseLeave = () => setIsHovering(false);

  const originalImage = "file:///" + sanitizedImagePath;
  const upscaledImage = "file:///" + sanitizedUpscaledImagePath;

  return (
    <div className="relative flex h-screen flex-col items-center">
      {/* Main image container */}
      <div
        className="relative h-full w-full cursor-crosshair bg-cover bg-no-repeat"
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <img
          src={originalImage}
          alt="Original"
          className="h-full w-full object-contain"
        />
        {isHovering && (
          <div
            className="pointer-events-none absolute h-12 w-12 border-2 border-white"
            style={{
              left: `${hoverPosition.x}%`,
              top: `${hoverPosition.y}%`,
              transform: "translate(-50%, -50%)",
            }}
          />
        )}
      </div>

      {/* Enlarged views for original and upscaled images */}
      {isHovering && (
        <div
          className="absolute flex gap-4"
          style={{
            left: `${hoverPosition.x}%`,
            top: `${hoverPosition.y + 10}%`, // Position below the cursor
            transform: "translate(-50%, 0)",
          }}
        >
          <div
            className="relative h-48 w-48 border border-gray-300 bg-cover bg-no-repeat"
            style={{
              backgroundImage: `url(${originalImage})`,
              backgroundPosition: `${hoverPosition.x}% ${hoverPosition.y}%`,
              backgroundSize: "200%", // Increase zoom level to match the zoomed box
            }}
          >
            <span className="absolute bottom-1 left-1 rounded bg-black bg-opacity-60 px-2 py-1 text-sm text-white">
              Original
            </span>
          </div>
          <div
            className="relative h-48 w-48 border border-gray-300 bg-cover bg-no-repeat"
            style={{
              backgroundImage: `url(${upscaledImage})`,
              backgroundPosition: `${hoverPosition.x}% ${hoverPosition.y}%`,
              backgroundSize: "200%", // Increase zoom level to match the zoomed box
            }}
          >
            <span className="absolute bottom-1 left-1 rounded bg-black bg-opacity-60 px-2 py-1 text-sm text-white">
              AI Upscaled
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LensViewer;
