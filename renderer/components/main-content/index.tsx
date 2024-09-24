import useLog from "../hooks/useLog";
import { useState, useCallback, useMemo, useRef } from "react";
import ELECTRON_COMMANDS from "../../../common/commands";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { logAtom } from "../../atoms/logAtom";
import { modelsListAtom } from "../../atoms/modelsListAtom";
import {
  batchModeAtom,
  lensSizeAtom,
  compressionAtom,
  dontShowCloudModalAtom,
  noImageProcessingAtom,
  savedOutputPathAtom,
  progressAtom,
  scaleAtom,
  viewTypeAtom,
  rememberOutputFolderAtom,
  customWidthAtom,
  useCustomWidthAtom,
  tileSizeAtom,
  showSidebarAtom,
} from "../../atoms/userSettingsAtom";
import { useToast } from "@/components/ui/use-toast";
import { sanitizePath } from "@common/sanitize-path";
import { translationAtom } from "@/atoms/translations-atom";
import getDirectoryFromPath from "@common/get-directory-from-path";
import { FEATURE_FLAGS } from "@common/feature-flags";
import { VALID_IMAGE_FORMATS } from "@/lib/valid-formats";
import ProgressBar from "../upscayl-tab/view/ProgressBar";
import RightPaneInfo from "../upscayl-tab/view/RightPaneInfo";
import ImageOptions from "../upscayl-tab/view/ImageOptions";
import { ReactCompareSlider } from "react-compare-slider";
import useUpscaylVersion from "../hooks/use-upscayl-version";
("use client");

const MainContent = ({
  imagePath,
  resetImagePaths,
  upscaledBatchFolderPath,
  setImagePath,
  validateImagePath,
  selectFolderHandler,
  selectImageHandler,
  upscaledImagePath,
  batchFolderPath,
  doubleUpscaylCounter,
  setDimensions,
}) => {
  const t = useAtomValue(translationAtom);
  const { logit } = useLog();
  const { toast } = useToast();

  const upscaledImageRef = useRef<HTMLImageElement>(null);

  const [backgroundPosition, setBackgroundPosition] = useState("0% 0%");
  const [lensPosition, setLensPosition] = useState({ x: 0, y: 0 });

  const setOutputPath = useSetAtom(savedOutputPathAtom);
  const progress = useAtomValue(progressAtom);
  const batchMode = useAtomValue(batchModeAtom);

  const viewType = useAtomValue(viewTypeAtom);
  const lensSize = useAtomValue(lensSizeAtom);
  const rememberOutputFolder = useAtomValue(rememberOutputFolderAtom);
  const [zoomAmount, setZoomAmount] = useState("100");
  const version = useUpscaylVersion();

  const sanitizedUpscaledImagePath = useMemo(
    () => sanitizePath(upscaledImagePath),
    [upscaledImagePath],
  );

  // DRAG AND DROP HANDLERS
  const handleDragEnter = (e) => {
    e.preventDefault();
    console.log("drag enter");
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    console.log("drag leave");
  };
  const handleDragOver = (e) => {
    e.preventDefault();
    console.log("drag over");
  };

  const openFolderHandler = (e) => {
    const { logit } = useLog();
    logit("📂 OPEN_FOLDER: ", upscaledBatchFolderPath);
    window.electron.send(
      ELECTRON_COMMANDS.OPEN_FOLDER,
      upscaledBatchFolderPath,
    );
  };

  const sanitizedImagePath = useMemo(
    () => sanitizePath(imagePath),
    [imagePath],
  );

  const handleDrop = (e) => {
    e.preventDefault();
    resetImagePaths();
    if (
      e.dataTransfer.items.length === 0 ||
      e.dataTransfer.files.length === 0
    ) {
      logit("👎 No valid files dropped");
      toast({
        title: t("ERRORS.INVALID_IMAGE_ERROR.TITLE"),
        description: t("ERRORS.INVALID_IMAGE_ERROR.ADDITIONAL_DESCRIPTION"),
      });
      return;
    }
    const type = e.dataTransfer.items[0].type;
    const filePath = e.dataTransfer.files[0].path;
    const extension = e.dataTransfer.files[0].name.split(".").at(-1);
    logit("⤵️ Dropped file: ", JSON.stringify({ type, filePath, extension }));
    if (
      !type.includes("image") ||
      !VALID_IMAGE_FORMATS.includes(extension.toLowerCase())
    ) {
      logit("🚫 Invalid file dropped");
      toast({
        title: t("ERRORS.INVALID_IMAGE_ERROR.TITLE"),
        description: t("ERRORS.INVALID_IMAGE_ERROR.ADDITIONAL_DESCRIPTION"),
      });
    } else {
      logit("🖼 Setting image path: ", filePath);
      setImagePath(filePath);
      var dirname = getDirectoryFromPath(filePath);
      logit("🗂 Setting output path: ", dirname);
      if (!FEATURE_FLAGS.APP_STORE_BUILD) {
        if (!rememberOutputFolder) {
          setOutputPath(dirname);
        }
      }
      validateImagePath(filePath);
    }
  };

  const handlePaste = (e) => {
    resetImagePaths();
    e.preventDefault();
    const type = e.clipboardData.items[0].type;
    const filePath = e.clipboardData.files[0].path;
    const extension = e.clipboardData.files[0].name.split(".").at(-1);
    logit("📋 Pasted file: ", JSON.stringify({ type, filePath, extension }));
    if (
      !type.includes("image") &&
      !VALID_IMAGE_FORMATS.includes(extension.toLowerCase())
    ) {
      toast({
        title: t("ERRORS.INVALID_IMAGE_ERROR.TITLE"),
        description: t("ERRORS.INVALID_IMAGE_ERROR.ADDITIONAL_DESCRIPTION"),
      });
    } else {
      setImagePath(filePath);
      var dirname = getDirectoryFromPath(filePath);
      logit("🗂 Setting output path: ", dirname);
      if (!rememberOutputFolder) {
        setOutputPath(dirname);
      }
    }
  };

  const handleMouseMove = useCallback((e: any) => {
    const { left, top, width, height } = e.target.getBoundingClientRect();
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top) / height) * 100;
    setBackgroundPosition(`${x}% ${y}%`);
  }, []);

  const handleMouseMoveCompare = (e: React.MouseEvent) => {
    if (upscaledImageRef.current) {
      const { left, top, width, height } =
        upscaledImageRef.current.getBoundingClientRect();
      const x = e.clientX - left;
      const y = e.clientY - top;
      setLensPosition({
        x: Math.max(0, Math.min(x - lensSize, width - lensSize * 2)),
        y: Math.max(0, Math.min(y - lensSize / 2, height - lensSize)),
      });
    }
  };

  const stopHandler = () => {
    window.electron.send(ELECTRON_COMMANDS.STOP);
    logit("🛑 Stopping Upscayl");
    resetImagePaths();
  };

  return (
    <div
      className="relative flex h-screen w-full flex-col items-center justify-center"
      onDrop={(e) => handleDrop(e)}
      onDragOver={(e) => handleDragOver(e)}
      onDragEnter={(e) => handleDragEnter(e)}
      onDragLeave={(e) => handleDragLeave(e)}
      onDoubleClick={() => {
        if (batchMode) {
          selectFolderHandler();
        } else {
          selectImageHandler();
        }
      }}
      onPaste={(e) => handlePaste(e)}
    >
      {window.electron.platform === "mac" && (
        <div className="mac-titlebar absolute top-0 h-8 w-full"></div>
      )}
      {progress.length > 0 &&
      upscaledImagePath.length === 0 &&
      upscaledBatchFolderPath.length === 0 ? (
        <ProgressBar
          batchMode={batchMode}
          progress={progress}
          doubleUpscaylCounter={doubleUpscaylCounter}
          stopHandler={stopHandler}
        />
      ) : null}
      {/* DEFAULT PANE INFO */}
      {((!batchMode &&
        imagePath.length === 0 &&
        upscaledImagePath.length === 0) ||
        (batchMode &&
          batchFolderPath.length === 0 &&
          upscaledBatchFolderPath.length === 0)) && (
        <RightPaneInfo version={version} batchMode={batchMode} />
      )}
      {/* SHOW SELECTED IMAGE */}
      {!batchMode && upscaledImagePath.length === 0 && imagePath.length > 0 && (
        <>
          <ImageOptions
            zoomAmount={zoomAmount}
            setZoomAmount={setZoomAmount}
            resetImagePaths={resetImagePaths}
            hideZoomOptions={true}
          />
          <img
            src={"file:///" + sanitizePath(imagePath)}
            onLoad={(e: any) => {
              setDimensions({
                width: e.target.naturalWidth,
                height: e.target.naturalHeight,
              });
            }}
            draggable="false"
            alt=""
            className="h-full w-full bg-gradient-to-br from-base-300 to-base-100 object-contain"
          />
        </>
      )}
      {/* BATCH UPSCALE SHOW SELECTED FOLDER */}
      {batchMode &&
        upscaledBatchFolderPath.length === 0 &&
        batchFolderPath.length > 0 && (
          <p className="select-none text-base-content">
            <span className="font-bold">
              {t("APP.PROGRESS.BATCH.SELECTED_FOLDER_TITLE")}
            </span>{" "}
            {batchFolderPath}
          </p>
        )}
      {/* BATCH UPSCALE DONE INFO */}
      {batchMode && upscaledBatchFolderPath.length > 0 && (
        <div className="z-50 flex flex-col items-center">
          <p className="select-none py-4 font-bold text-base-content">
            {t("APP.PROGRESS.BATCH.DONE_TITLE")}
          </p>
          <button
            className="bg-gradient-blue btn btn-primary rounded-btn p-3 font-medium text-white/90 transition-colors"
            onClick={openFolderHandler}
          >
            {t("APP.PROGRESS.BATCH.OPEN_UPSCAYLED_FOLDER_TITLE")}
          </button>
        </div>
      )}
      <ImageOptions
        zoomAmount={zoomAmount}
        setZoomAmount={setZoomAmount}
        resetImagePaths={resetImagePaths}
      />
      {!batchMode && viewType === "lens" && upscaledImagePath && imagePath && (
        <div
          className="group relative h-full w-full overflow-hidden"
          onMouseMove={handleMouseMoveCompare}
        >
          {/* UPSCALED IMAGE */}
          <img
            className="h-full w-full object-contain"
            src={"file:///" + sanitizedUpscaledImagePath}
            alt="Upscaled"
            ref={upscaledImageRef}
          />
          {/* LENS */}
          <div
            className="pointer-events-none absolute opacity-0 transition-opacity before:absolute before:left-1/2 before:h-full before:w-[2px] before:bg-white group-hover:opacity-100"
            style={{
              left: `${lensPosition.x}px`,
              top: `${lensPosition.y}px`,
              width: lensSize * 2,
              height: lensSize,
              border: "2px solid white",
              boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5)",
            }}
          >
            <div className="flex h-full w-full">
              <div className="h-full w-full overflow-hidden">
                <img
                  src={"file:///" + sanitizedImagePath}
                  alt="Original"
                  className="h-full w-full"
                  style={{
                    objectFit: "contain",
                    objectPosition: `${-lensPosition.x}px ${-lensPosition.y}px`,
                    transform: `scale(${parseInt(zoomAmount) / 100})`,
                    transformOrigin: "top left",
                  }}
                />
              </div>
              <div className="h-full w-full overflow-hidden">
                <img
                  src={"file:///" + sanitizedUpscaledImagePath}
                  alt="Upscaled"
                  className="h-full w-full"
                  style={{
                    objectFit: "contain",
                    objectPosition: `${-lensPosition.x}px ${-lensPosition.y}px`,
                    transform: `scale(${parseInt(zoomAmount) / 100})`,
                    transformOrigin: "top left",
                  }}
                />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 flex w-full items-center justify-around bg-black bg-opacity-50 p-1 px-2 text-center text-xs text-white backdrop-blur-sm">
              <span>Original</span>
              <span>Upscayl</span>
            </div>
          </div>
        </div>
      )}
      {/* COMPARISON SLIDER */}
      {!batchMode &&
        viewType === "slider" &&
        imagePath.length > 0 &&
        upscaledImagePath.length > 0 && (
          <>
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
          </>
        )}
    </div>
  );
};

export default MainContent;
