import SidebarClosed from "@/components/icons/SidebarClosed";
import SidebarOpened from "@/components/icons/SidebarOpened";
import React, { useEffect, useState } from "react";

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
  const [openSidebar, setOpenSidebar] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("zoomAmount")) {
      localStorage.setItem("zoomAmount", zoomAmount);
    } else {
      setZoomAmount(localStorage.getItem("zoomAmount"));
    }
  }, []);

  return (
    <div className="">
      {/* <div
        className={`bg-base-100 p-4 rounded-btn rounded-r-none fixed top-1/2 right-0 z-50 shadow-xl shadow-black group flex items-center gap-2`}
        onClick={() => setOpenSidebar(!openSidebar)}>
        <Sidebar className="text-white text-xl" />
      </div> */}

      <div
        className={`transition-all duration-500 bg-base-100 text-base-content h-screen w-[28rem] fixed right-0 top-0 z-50 shadow-xl shadow-black ${
          openSidebar ? "right-0" : "-right-full translate-x-full"
        }`}>
        <div
          className={`transition-all duration-500 bg-base-100 p-4 rounded-btn rounded-r-none absolute top-1/2 right-[100%] z-50 cursor-pointer flex items-center group gap-2`}
          onClick={() => {
            setOpenSidebar(!openSidebar);
          }}>
          {openSidebar ? (
            <SidebarOpened className="text-white text-xl" />
          ) : (
            <SidebarClosed className="text-white text-xl" />
          )}
        </div>
        <div className="flex flex-col justify-center gap-5 overflow-auto p-5">
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
