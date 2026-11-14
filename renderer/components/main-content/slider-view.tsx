import { useCallback, useState } from "react";
import { localFileUrl } from "@/lib/file-url";
import { ReactCompareSlider } from "react-compare-slider";
import useTranslation from "../hooks/use-translation";
import { Button } from "../ui/button";

const SliderView = ({
  sanitizedImagePath,
  sanitizedUpscaledImagePath,
  beforeSize,
  afterSize,
  scale,
  isMaximized,
  zoomAmount,
}: {
  sanitizedImagePath: string;
  sanitizedUpscaledImagePath: string;
  beforeSize: string;
  afterSize: string;
  scale: string;
  isMaximized: boolean;
  zoomAmount: string;
}) => {
  const t = useTranslation();

  const [backgroundPosition, setBackgroundPosition] = useState("0% 0%");

  const handleMouseMove = useCallback((e: any) => {
    const { left, top, width, height } = e.target.getBoundingClientRect();
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top) / height) * 100;
    setBackgroundPosition(`${x}% ${y}%`);
  }, []);

  return (
    <ReactCompareSlider
      itemOne={
        <>
          {isMaximized && beforeSize.length > 0 ? (
            <div className="absolute top-2 left-2 z-10 min-w-28 rounded-2xl bg-black/30 px-3 py-2 text-sm backdrop-blur-md">
              <p className="font-semibold">{t("Original")}</p>
              <p className="text-sm text-foreground/80">{beforeSize}</p>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="pointer-events-none absolute top-2 left-2 z-10 bg-black/20 font-semibold backdrop-blur-md"
              asChild
            >
              <p>{t("Original")}</p>
            </Button>
          )}

          <img
            /* USE REGEX TO GET THE FILENAME AND ENCODE IT INTO PROPER FORM IN ORDER TO AVOID ERRORS DUE TO SPECIAL CHARACTERS */
            src={localFileUrl(sanitizedImagePath)}
            alt={t("Original")}
            onMouseMove={handleMouseMove}
            style={{
              objectFit: "contain",
              backgroundPosition: "0% 0%",
              transformOrigin: backgroundPosition,
              ["--zoom-scale" as string]: `${(Number(zoomAmount) || 100) / 100}`,
            }}
            className="slider-zoom from-base-300 to-base-100 h-full w-full bg-linear-to-br transition-transform"
          />
        </>
      }
      itemTwo={
        <>
          {isMaximized && afterSize.length > 0 ? (
            <div className="absolute top-2 right-2 z-10 flex min-w-32 items-center justify-end gap-3 rounded-2xl bg-black/30 px-3 py-2 text-end text-sm backdrop-blur-md">
              <div>
                <p className="font-semibold">
                  {t("Upscayled")}
                </p>
                <p className="text-sm text-foreground/80">{afterSize}</p>
              </div>

              <Button
                variant="outline"
                size="icon"
                className="borer-none pointer-events-none rounded-xl bg-linear-to-r from-teal-500 to-teal-300 font-semibold text-zinc-900 backdrop-blur-md"
                asChild
              >
                <span>{scale}x</span>
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="borer-none pointer-events-none absolute top-2 right-2 z-10 bg-linear-to-r from-teal-500 to-teal-300 font-semibold text-zinc-900 backdrop-blur-md"
              asChild
            >
              <p>{t("Upscayled")}</p>
            </Button>
          )}
          <img
            /* USE REGEX TO GET THE FILENAME AND ENCODE IT INTO PROPER FORM IN ORDER TO AVOID ERRORS DUE TO SPECIAL CHARACTERS */
            src={localFileUrl(sanitizedUpscaledImagePath)}
            alt={t("Upscayled")}
            style={{
              objectFit: "contain",
              backgroundPosition: "0% 0%",
              transformOrigin: backgroundPosition,
              ["--zoom-scale" as string]: `${(Number(zoomAmount) || 100) / 100}`,
            }}
            onMouseMove={handleMouseMove}
            className="slider-zoom from-base-300 to-base-100 h-full w-full bg-linear-to-br transition-transform"
          />
        </>
      }
      className="compare-slider-group relative h-full"
    />
  );
};

export default SliderView;
