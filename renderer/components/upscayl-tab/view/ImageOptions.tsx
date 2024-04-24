import { lensSizeAtom, viewTypeAtom } from "@/atoms/userSettingsAtom";
import { cn } from "@/lib/utils";
import { useAtom } from "jotai";
import { WrenchIcon } from "lucide-react";
import { useEffect, useState } from "react";

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
      className={`fixed right-0 top-0 z-50 h-screen w-[28rem] bg-base-100 text-base-content shadow-xl shadow-base-300 transition-all duration-500 ${
        openSidebar ? "right-0" : "-right-full translate-x-full"
      }`}
    >
      <div
        className={`group absolute right-[100%] top-1/2 z-50 flex cursor-pointer items-center gap-2 rounded-btn rounded-r-none bg-base-100 p-4 transition-all duration-500`}
        onClick={() => {
          setOpenSidebar(!openSidebar);
        }}
      >
        <WrenchIcon
          className={cn(
            "animate text-xl text-base-content",
            openSidebar ? "rotate-180" : "rotate-0",
          )}
        />
      </div>

      <div className="flex flex-col justify-center gap-5 overflow-auto p-5">
        <button className="btn btn-primary" onClick={resetImagePaths}>
          Reset Image
        </button>

        <div className="flex flex-row items-center gap-2">
          <p className="text-sm font-medium">Lens View</p>
          <input
            type="checkbox"
            className="toggle"
            checked={viewType === "slider"}
            onChange={(e) => {
              setViewType(e.target.checked ? "slider" : "lens");
            }}
          />
          <p className="text-sm font-medium">Slider View</p>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium">Zoom Amount ({zoomAmount}%)</p>
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
          <p className="text-sm font-medium">Lens Size ({lensSize / 10})</p>
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
  );
};

export default ImageOptions;
