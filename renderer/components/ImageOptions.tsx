import React from "react";

const ImageOptions = ({
  zoomAmount,
  setZoomAmount,
  leftImageRef,
  rightImageRef,
  resetImagePaths,
}: {
  zoomAmount: string;
  setZoomAmount: (arg: any) => void;
  leftImageRef: React.RefObject<HTMLImageElement>;
  rightImageRef: React.RefObject<HTMLImageElement>;
  resetImagePaths: () => void;
}) => {
  const [zoomLevel, setZoomLevel] = React.useState("125");

  const handleZoom = (direction: number) => {
    if (direction === 0) {
      setZoomAmount("");
      setZoomLevel("100");
      console.log("🚀 => file: ImageOptions.tsx:24 => zoomLevel", zoomLevel);
    } else if (direction === 1 && zoomLevel < "200") {
      setZoomLevel((parseInt(zoomLevel) + direction * 25).toString());
      setZoomAmount("zoom-" + zoomLevel);
      console.log("🚀 => file: ImageOptions.tsx:24 => zoomLevel", zoomLevel);
    } else if (direction === -1 && zoomLevel > "100") {
      setZoomLevel((parseInt(zoomLevel) + direction * 25).toString());
      setZoomAmount("zoom-" + zoomLevel);
      console.log("🚀 => file: ImageOptions.tsx:24 => zoomLevel", zoomLevel);
    }

    if (zoomLevel > "200" || zoomLevel < "100") {
      setZoomAmount("100");
    }
  };

  return (
    <div className="animate rounded-btn collapse absolute top-0 z-50 m-2 opacity-25 hover:opacity-100">
      <input type="checkbox" className="peer" />
      <div className="collapse-title bg-base-100 text-center text-sm font-semibold uppercase text-primary-content peer-checked:bg-base-300 peer-checked:text-base-content">
        Show/Hide Image Settings
      </div>

      <div className="collapse-content bg-base-100 text-base-content">
        <div className="flex max-h-96 flex-col justify-center gap-5 overflow-auto p-5">
          <button className="btn-primary btn" onClick={resetImagePaths}>
            Reset Image
          </button>
          <div className="flex flex-row items-center gap-2">
            <p className="w-20">Zoom:</p>
            <button
              className={`btn-primary btn ${
                zoomAmount === "100%" ? "btn-secondary" : "btn-primary"
              }`}
              onClick={() => setZoomAmount("100%")}>
              100%
            </button>
            <button
              className={`btn-primary btn ${
                zoomAmount === "125%" ? "btn-secondary" : "btn-primary"
              }`}
              onClick={() => setZoomAmount("125%")}>
              125%
            </button>
            <button
              className={`btn-primary btn ${
                zoomAmount === "150%" ? "btn-secondary" : "btn-primary"
              }`}
              onClick={() => setZoomAmount("150%")}>
              150%
            </button>
            <button
              className={`btn-primary btn ${
                zoomAmount === "175%" ? "btn-secondary" : "btn-primary"
              }`}
              onClick={() => setZoomAmount("175%")}>
              175%
            </button>
            <button
              className={`btn-primary btn ${
                zoomAmount === "200%" ? "btn-secondary" : "btn-primary"
              }`}
              onClick={() => setZoomAmount("200%")}>
              200%
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageOptions;
