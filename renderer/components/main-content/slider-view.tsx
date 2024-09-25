import React, { useCallback, useState } from "react";
import { ReactCompareSlider } from "react-compare-slider";
import useTranslation from "../hooks/use-translation";

const SliderView = ({
  sanitizedImagePath,
  sanitizedUpscaledImagePath,
  zoomAmount,
}: {
  sanitizedImagePath: string;
  sanitizedUpscaledImagePath: string;
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
          <p className="absolute bottom-1 left-1 rounded-md bg-black p-1 text-sm font-medium text-white opacity-30">
            {t("APP.SLIDER.ORIGINAL_TITLE")}
          </p>

          <img
            /* USE REGEX TO GET THE FILENAME AND ENCODE IT INTO PROPER FORM IN ORDER TO AVOID ERRORS DUE TO SPECIAL CHARACTERS */
            src={"file:///" + sanitizedImagePath}
            alt={t("APP.SLIDER.ORIGINAL_TITLE")}
            onMouseMove={handleMouseMove}
            style={{
              objectFit: "contain",
              backgroundPosition: "0% 0%",
              transformOrigin: backgroundPosition,
            }}
            className={`h-full w-full bg-gradient-to-br from-base-300 to-base-100 transition-transform group-hover:scale-[${zoomAmount}%]`}
          />
        </>
      }
      itemTwo={
        <>
          <p className="absolute bottom-1 right-1 rounded-md bg-black p-1 text-sm font-medium text-white opacity-30">
            {t("APP.SLIDER.UPSCAYLED_TITLE")}
          </p>
          <img
            /* USE REGEX TO GET THE FILENAME AND ENCODE IT INTO PROPER FORM IN ORDER TO AVOID ERRORS DUE TO SPECIAL CHARACTERS */
            src={"file:///" + sanitizedUpscaledImagePath}
            alt={t("APP.SLIDER.UPSCAYLED_TITLE")}
            style={{
              objectFit: "contain",
              backgroundPosition: "0% 0%",
              transformOrigin: backgroundPosition,
            }}
            onMouseMove={handleMouseMove}
            className={`h-full w-full bg-gradient-to-br from-base-300 to-base-100 transition-transform group-hover:scale-[${
              zoomAmount || "100%"
            }%]`}
          />
        </>
      }
      className="group h-screen"
    />
  );
};

export default SliderView;
