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
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  const zoomLevel = 4; // Adjust zoom level as needed

  const handleMouseMove = (e: React.MouseEvent) => {
    const { left, top, width, height } =
      e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;

    setHoverPosition({ x, y });
  };

  const originalImage = "file:///" + sanitizedImagePath;
  const upscaledImage = "file:///" + sanitizedUpscaledImagePath;

  return (
    <div className="group relative flex h-screen flex-col items-center">
      {/* Main image container */}
      <div
        className="relative h-full w-full cursor-crosshair bg-cover bg-no-repeat"
        onMouseMove={handleMouseMove}
      >
        <img
          src={originalImage}
          alt="Original"
          className="h-full w-full object-contain"
        />
        <div
          className="pointer-events-none absolute hidden h-12 w-12 border-2 border-white group-hover:block"
          style={{
            left: `${hoverPosition.x}%`,
            top: `${hoverPosition.y}%`,
            transform: "translate(-50%, -50%)",
          }}
        />
      </div>

      {/* Enlarged views for original and upscaled images */}
      <div
        className="pointer-events-none absolute hidden gap-4 group-hover:flex "
        style={{
          left: `${hoverPosition.x}%`,
          top: `${hoverPosition.y}%`, // Position below the cursor
          transform: "translate(-50%, 0)",
        }}
      >
        <div
          className="relative h-48 w-48 border border-gray-300 bg-cover bg-no-repeat"
          style={{
            backgroundImage: `url(${originalImage})`,
            backgroundPosition: `${hoverPosition.x}% ${hoverPosition.y}%`,
            backgroundSize: `${100 * zoomLevel}%`, // Increase zoom level to match the white box
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
            backgroundSize: `${100 * zoomLevel}%`, // Increase zoom level to match the white box
          }}
        >
          <span className="absolute bottom-1 left-1 rounded bg-black bg-opacity-60 px-2 py-1 text-sm text-white">
            AI Upscaled
          </span>
        </div>
      </div>
    </div>
  );
};

export default LensViewer;
