import { translationAtom } from "@/atoms/translations-atom";
import { userStatsAtom, viewTypeAtom } from "@/atoms/user-settings-atom";
import { cn } from "@/lib/utils";
import { useAtom, useAtomValue } from "jotai";
import { EllipsisIcon } from "lucide-react";
import { useEffect, useState } from "react";

const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds.toFixed(0)}s`;
  }
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

const MoreOptionsDrawer = ({
  zoomAmount,
  setZoomAmount,
  resetImagePaths,
}: {
  zoomAmount: string;
  setZoomAmount: (arg: any) => void;
  resetImagePaths: () => void;
}) => {
  const [openSidebar, setOpenSidebar] = useState(false);
  const [viewType, setViewType] = useAtom(viewTypeAtom);
  const t = useAtomValue(translationAtom);
  const userStats = useAtomValue(userStatsAtom);
  const drawerId = "more-options-drawer";

  useEffect(() => {
    if (!localStorage.getItem("zoomAmount")) {
      localStorage.setItem("zoomAmount", zoomAmount);
    } else {
      setZoomAmount(localStorage.getItem("zoomAmount"));
    }
  }, []);

  return (
    <div
      className={cn(
        "drawer drawer-end fixed inset-0 z-50 w-full",
        openSidebar ? "pointer-events-auto" : "pointer-events-none",
      )}
    >
      <input
        id={drawerId}
        type="checkbox"
        className="drawer-toggle"
        checked={openSidebar}
        onChange={(e) => {
          setOpenSidebar(e.target.checked);
        }}
      />

      <div className="drawer-content pointer-events-none">
        <label
          htmlFor={drawerId}
          aria-label={openSidebar ? "Close more options" : "Open more options"}
          className={cn(
            "btn btn-ghost bg-base-100 text-base-content pointer-events-auto absolute top-1/2 right-0 z-50 h-auto min-h-0 -translate-y-1/2 rounded-r-none px-4 py-6 shadow-xl transition-[right] duration-300",
          )}
          style={{ right: openSidebar ? "28rem" : "0" }}
        >
          <EllipsisIcon
            className={cn(
              "text-base-content text-xl transition-transform duration-300",
              openSidebar ? "rotate-90" : "rotate-0",
            )}
          />
        </label>
      </div>

      <div className="drawer-side pointer-events-auto">
        <label
          htmlFor={drawerId}
          aria-label="Close more options"
          className="drawer-overlay"
        />

        <div
          onDoubleClick={(e) => {
            e.stopPropagation();
          }}
          className="bg-base-100 text-base-content flex min-h-full w-[28rem] max-w-full flex-col overflow-hidden p-5 shadow-xl"
        >
          <div className="flex flex-col gap-5">
            <button className="btn btn-primary" onClick={resetImagePaths}>
              {t("APP.MORE_OPTIONS_DRAWER.RESET_BUTTON_TITLE")}
            </button>

            <div className="flex flex-row items-center gap-2">
              <p className="text-sm font-medium">
                {t("APP.MORE_OPTIONS_DRAWER.LENS_VIEW_TITLE")}
              </p>
              <input
                type="checkbox"
                className="toggle"
                checked={viewType === "slider"}
                onChange={(e) => {
                  setViewType(e.target.checked ? "slider" : "lens");
                }}
              />
              <p className="text-sm font-medium">
                {t("APP.MORE_OPTIONS_DRAWER.SLIDER_VIEW_TITLE")}
              </p>
            </div>

            {viewType !== "lens" && (
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium">
                  {t("APP.MORE_OPTIONS_DRAWER.ZOOM_AMOUNT_TITLE")} ({zoomAmount}
                  %)
                </p>
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
            )}
          </div>

          <div className="mt-5 flex min-h-0 flex-1 flex-col gap-2">
            <p className="text-base-content text-sm font-semibold uppercase">
              Stats
            </p>

            <div className="stats stats-vertical overflow-y-auto">
              <div className="stat">
                <div className="stat-title">
                  {t("APP.MORE_OPTIONS_DRAWER.TOTAL_UPSCAYLS")}
                </div>
                <div className="stat-value text-base-content text-2xl">
                  {userStats.totalUpscayls}
                </div>
              </div>

              <div className="stat">
                <div className="stat-title">
                  {t("APP.MORE_OPTIONS_DRAWER.TOTAL_BATCH_UPSCAYLS")}
                </div>
                <div className="stat-value text-base-content text-2xl">
                  {userStats.batchUpscayls}
                </div>
              </div>

              <div className="stat">
                <div className="stat-title">
                  {t("APP.MORE_OPTIONS_DRAWER.TOTAL_IMAGE_UPSCAYLS")}
                </div>
                <div className="stat-value text-base-content text-2xl">
                  {userStats.imageUpscayls}
                </div>
              </div>

              <div className="stat">
                <div className="stat-title">
                  {t("APP.MORE_OPTIONS_DRAWER.TOTAL_DOUBLE_UPSCAYLS")}
                </div>
                <div className="stat-value text-base-content text-2xl">
                  {userStats.doubleUpscayls}
                </div>
              </div>

              <div className="stat">
                <div className="stat-title">
                  {t("APP.MORE_OPTIONS_DRAWER.AVERAGE_UPSCAYL_TIME")}
                </div>
                <div className="stat-value text-base-content text-2xl">
                  {formatDuration(userStats.averageUpscaylTime / 1000)}
                </div>
              </div>

              <div className="stat">
                <div className="stat-title">
                  {t("APP.MORE_OPTIONS_DRAWER.LAST_UPSCAYL_DURATION")}
                </div>
                <div className="stat-value text-base-content text-2xl">
                  {formatDuration(userStats.lastUpscaylDuration / 1000)}
                </div>
              </div>

              <div className="stat">
                <div className="stat-title">
                  {t("APP.MORE_OPTIONS_DRAWER.LAST_USED_AT")}
                </div>
                <div className="stat-value text-base-content text-2xl">
                  {new Date(userStats.lastUsedAt).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoreOptionsDrawer;
