import { useEffect, useState } from "react";
import { useAtomValue } from "jotai";
import { sanitizePath } from "@common/sanitize-path";
import { HistoryItem } from "@/atoms/history-atom";
import { viewTypeAtom } from "@/atoms/user-settings-atom";
import { cn } from "@/lib/utils";
import useTranslation from "../hooks/use-translation";
import LensViewer from "../main-content/lens-view";
import SliderView from "../main-content/slider-view";
import ToolBar from "../main-content/toolbar";
import { ImageSize, loadImageSize } from "./image-utils";

export const HistoryViewer = ({
  item,
  maximize,
  setMaximize,
  onMissing,
}: {
  item: HistoryItem;
  maximize: boolean;
  setMaximize: React.Dispatch<React.SetStateAction<boolean>>;
  onMissing: () => void;
}) => {
  const t = useTranslation();
  const viewType = useAtomValue(viewTypeAtom);
  const [zoomAmount, setZoomAmount] = useState("100");
  const [sizes, setSizes] = useState<{ before: ImageSize; after: ImageSize }>();
  const isRemoveBackground = item.kind === "remove-background";
  const sanitizedImagePath = sanitizePath(item.inputPath);
  const sanitizedUpscaledImagePath = sanitizePath(item.outputPath);

  useEffect(() => {
    let cancelled = false;
    Promise.all([loadImageSize(item.inputPath), loadImageSize(item.outputPath)])
      .then(([before, after]) => {
        if (!cancelled) setSizes({ before, after });
      })
      .catch(() => {
        if (!cancelled) onMissing();
      });
    return () => {
      cancelled = true;
    };
  }, [item.inputPath, item.outputPath]);

  const aspectRatio = sizes && sizes.after.width / sizes.after.height;

  return (
    <div className="relative size-full">
      {/* Size the view to the image so the slider stops at its edges. */}
      <div
        className="flex size-full items-center justify-center"
        style={{ containerType: "size" }}
      >
        <div
          className={cn(
            "overflow-hidden rounded-2xl",
            !aspectRatio && "size-full",
            isRemoveBackground && "transparency-grid",
          )}
          style={
            aspectRatio
              ? { aspectRatio, width: `min(100cqw, 100cqh * ${aspectRatio})` }
              : undefined
          }
        >
          {viewType === "lens" && !isRemoveBackground ? (
            <LensViewer
              sanitizedImagePath={sanitizedImagePath}
              sanitizedUpscaledImagePath={sanitizedUpscaledImagePath}
            />
          ) : (
            <SliderView
              sanitizedImagePath={sanitizedImagePath}
              sanitizedUpscaledImagePath={sanitizedUpscaledImagePath}
              beforeSize={
                sizes ? `${sizes.before.width} x ${sizes.before.height}` : ""
              }
              afterSize={
                sizes ? `${sizes.after.width} x ${sizes.after.height}` : ""
              }
              scale={item.settings?.scale ?? ""}
              isMaximized={maximize}
              zoomAmount={zoomAmount}
              afterLabel={isRemoveBackground ? t("After") : undefined}
            />
          )}
        </div>
      </div>
      <ToolBar
        zoomAmount={zoomAmount}
        setZoomAmount={setZoomAmount}
        resetImagePaths={() => {
          setZoomAmount("100");
          setMaximize(false);
        }}
        maximize={maximize}
        setMaximize={setMaximize}
        hasImage
        hasUpscayledImage={!isRemoveBackground}
      />
    </div>
  );
};
