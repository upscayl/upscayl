import React from "react";

const ImageOptions = ({
  zoomAmount,
  setZoomAmount,
}: {
  zoomAmount: number;
  setZoomAmount: (arg: any) => void;
}) => {
  const handleZoom = (direction: number) => {
    console.log(zoomAmount + direction * 25);
    if (direction === 0) {
      setZoomAmount("");
    } else {
      setZoomAmount("zoom-125");
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
          <button className="btn-primary btn">Reset Image</button>
          <div className="flex flex-row items-center gap-2">
            <p className="w-20">Zoom:</p>
            <button className="btn-primary btn" onClick={() => handleZoom(-1)}>
              - 25%
            </button>
            <button className="btn-primary btn" onClick={() => handleZoom(0)}>
              100%
            </button>
            <button className="btn-primary btn" onClick={() => handleZoom(1)}>
              + 25%
            </button>
          </div>
          <div className="flex flex-row items-center gap-2">
            <p className="w-20">Position:</p>
            <button className="btn-primary btn">Top</button>
            <button className="btn-primary btn">Bottom</button>
            <button className="btn-primary btn">Right</button>
            <button className="btn-primary btn">Left</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageOptions;
