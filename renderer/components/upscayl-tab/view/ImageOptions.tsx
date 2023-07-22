import React, { useEffect } from "react";

const ImageOptions = ({
  zoomAmount,
  setZoomAmount,
  resetImagePaths,
  hideZoomOptions,
}: {
  zoomAmount: string;
  setZoomAmount: (arg: any) => void;
  resetImagePaths: () => void;
  hideZoomOptions?: boolean;
}) => {
  useEffect(() => {
    if (!localStorage.getItem("zoomAmount")) {
      localStorage.setItem("zoomAmount", zoomAmount);
    } else {
      setZoomAmount(localStorage.getItem("zoomAmount"));
    }
  }, []);

  return (
    <div className="animate rounded-btn collapse fixed top-1 z-50 m-2 backdrop-blur-lg">
      <input type="checkbox" className="peer" />
      {/* <div className="peer-checked:outline-title-none collapse-title bg-opacity-25 text-center text-sm font-semibold uppercase backdrop-blur-2xl peer-checked:bg-base-300 peer-checked:text-base-content"> */}
      <div className="outline-title peer-checked:outline-title-none collapse-title text-center text-sm font-semibold uppercase text-black mix-blend-difference outline-2 peer-checked:bg-base-300 peer-checked:text-base-content">
        Show/Hide Image Settings
      </div>

      <div className="collapse-content bg-base-100 text-base-content">
        <div className="flex max-h-96 flex-col justify-center gap-5 overflow-auto p-5">
          <button className="btn-primary btn" onClick={resetImagePaths}>
            Reset Image
          </button>
          {!hideZoomOptions && (
            <div className="flex flex-row items-center gap-2">
              <p className="w-20">Zoom:</p>
              <button
                className={`btn-primary btn ${
                  zoomAmount === "100%" ? "btn-secondary" : "btn-primary"
                }`}
                onClick={() => {
                  setZoomAmount("100%");
                  localStorage.setItem("zoomAmount", "100%");
                }}>
                100%
              </button>
              <button
                className={`btn-primary btn ${
                  zoomAmount === "125%" ? "btn-secondary" : "btn-primary"
                }`}
                onClick={() => {
                  setZoomAmount("125%");
                  localStorage.setItem("zoomAmount", "125%");
                }}>
                125%
              </button>
              <button
                className={`btn-primary btn ${
                  zoomAmount === "150%" ? "btn-secondary" : "btn-primary"
                }`}
                onClick={() => {
                  setZoomAmount("150%");
                  localStorage.setItem("zoomAmount", "150%");
                }}>
                150%
              </button>
              <button
                className={`btn-primary btn ${
                  zoomAmount === "175%" ? "btn-secondary" : "btn-primary"
                }`}
                onClick={() => {
                  setZoomAmount("175%");
                  localStorage.setItem("zoomAmount", "175%");
                }}>
                175%
              </button>
              <button
                className={`btn-primary btn ${
                  zoomAmount === "200%" ? "btn-secondary" : "btn-primary"
                }`}
                onClick={() => {
                  setZoomAmount("200%");
                  localStorage.setItem("zoomAmount", "200%");
                }}>
                200%
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageOptions;
