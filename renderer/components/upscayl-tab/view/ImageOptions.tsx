import { lensSizeAtom, viewTypeAtom } from "@/atoms/userSettingsAtom";
import SidebarClosed from "@/components/icons/SidebarClosed";
import SidebarOpened from "@/components/icons/SidebarOpened";
import { useAtom } from "jotai";
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
  const [viewType, setViewType] = useAtom(viewTypeAtom);
  const [lensSize, setLensSize] = useAtom(lensSizeAtom);

  useEffect(() => {
    if (!localStorage.getItem("zoomAmount")) {
      localStorage.setItem("zoomAmount", zoomAmount);
    } else {
      setZoomAmount(localStorage.getItem("zoomAmount"));
    }
  }, []);

  return (
    <div
      onDoubleClick={(e) => {
        e.stopPropagation();
      }}
      className="w-full h-full absolute">
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

          <div className="flex flex-row items-center gap-2">
            <p className="font-medium text-sm">Lens View</p>
            <input
              type="checkbox"
              className="toggle"
              onChange={(e) => {
                setViewType(e.target.checked ? "slider" : "lens");
              }}
            />
            <p className="font-medium text-sm">Slider View</p>
          </div>

          <div className="flex flex-col gap-2">
            <p className="font-medium text-sm">Zoom Amount ({zoomAmount}%)</p>
            <input
              type="range"
              min="100"
              max="1000"
              step={10}
              className="range range-md"
              value={parseInt(zoomAmount)}
              onChange={(e) => {
                setZoomAmount(e.target.value);
                localStorage.setItem("zoomAmount", e.target.value);
              }}
            />
          </div>

          <div className="flex flex-col gap-2">
            <p className="font-medium text-sm">Lens Size ({lensSize / 10})</p>
            <input
              type="range"
              min="20"
              max="400"
              step={10}
              className="range range-md"
              value={lensSize}
              onChange={(e) => {
                setLensSize(parseInt(e.target.value));
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageOptions;
