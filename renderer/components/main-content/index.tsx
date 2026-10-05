"use client";
import useLogger from "../hooks/use-logger";
import { useState, useMemo, useEffect, useId } from "react";
import { ELECTRON_COMMANDS } from "@common/electron-commands";
import { useAtom, useAtomValue } from "jotai";
import {
  batchModeAtom,
  lensSizeAtom,
  savedOutputPathAtom,
  progressAtom,
  viewTypeAtom,
  rememberOutputFolderAtom,
  scaleAtom,
  customWidthAtom,
  useCustomWidthAtom,
  doubleUpscaylAtom,
} from "../../atoms/user-settings-atom";
import { toast } from "sonner";
import { sanitizePath } from "@common/sanitize-path";
import { ImageFormat, VALID_IMAGE_FORMATS } from "@/lib/valid-formats";
import ProgressBar from "./progress-bar";
import InstructionsCard from "./instructions-card";
import MacTitlebarDragRegion from "./mac-titlebar-drag-region";
import LensViewer from "./lens-view";
import ImageViewer from "./image-viewer";
import useTranslation from "../hooks/use-translation";
import SliderView from "./slider-view";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import {
  ArrowRightIcon,
  ChevronDown,
  FolderOpenIcon,
  LoaderCircle,
  SidebarIcon,
  TriangleAlertIcon,
} from "lucide-react";
import useUpscaylResolution from "../hooks/use-upscayl-resolution";
import getFilenameFromPath from "@common/get-file-name";
import getBaseFileName from "@common/get-base-file-name";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import ToolBar from "./toolbar";
import { useIsMobile } from "@/hooks/use-mobile";

type MainContentProps = {
  imagePath: string;
  resetImagePaths: () => void;
  upscaledBatchFolderPath: string;
  setUpscaledBatchFolderPath: React.Dispatch<React.SetStateAction<string>>;
  setImagePath: React.Dispatch<React.SetStateAction<string>>;
  validateImagePath: (path: string) => void;
  selectFolderHandler: () => void;
  selectImageHandler: () => void;
  importDroppedPath: (path: string) => Promise<void>;
  upscaledImagePath: string;
  batchFolderPath: string;
  setBatchFolderPath: React.Dispatch<React.SetStateAction<string>>;
  dimensions: Record<"width" | "height", number | null>;
  doubleUpscaylCounter: number;
  setDimensions: React.Dispatch<
    React.SetStateAction<{
      width: number;
      height: number;
    }>
  >;
};

const MainContent = ({
  imagePath,
  resetImagePaths,
  upscaledBatchFolderPath,
  setUpscaledBatchFolderPath,
  setImagePath,
  validateImagePath,
  selectFolderHandler,
  selectImageHandler,
  importDroppedPath,
  upscaledImagePath,
  batchFolderPath,
  setBatchFolderPath,
  dimensions,
  doubleUpscaylCounter,
  setDimensions,
}: MainContentProps) => {
  const componentId = useId();
  const t = useTranslation();
  const logit = useLogger();

  const [outputPath, setOutputPath] = useAtom(savedOutputPathAtom);
  const progress = useAtomValue(progressAtom);
  const batchMode = useAtomValue(batchModeAtom);

  const viewType = useAtomValue(viewTypeAtom);
  const lensSize = useAtomValue(lensSizeAtom);
  const rememberOutputFolder = useAtomValue(rememberOutputFolderAtom);
  const [zoomAmount, setZoomAmount] = useState("100");
  const [maximize, setMaximize] = useState(false);

  const [batchImagePaths, setBatchImagePaths] = useState<string[]>([]);
  const [upscayledBatchImagePaths, setUpscayledBatchImagePaths] = useState<
    string[]
  >([]);
  const [selectedBatchImage, setSelectedBatchImage] = useState("");
  const [selectedUpscayldBatchImage, setUpscayledSelectedBatchImage] =
    useState("");
  const [isBatchSidebarOpen, setIsBatchSidebarOpen] = useState(false);

  const scale = useAtomValue(scaleAtom);
  const customWidth = useAtomValue(customWidthAtom);
  const useCustomWidth = useAtomValue(useCustomWidthAtom);
  const doubleUpscayl = useAtomValue(doubleUpscaylAtom);

  const upscaylResolution = useUpscaylResolution({
    dimensions,
    customWidth,
    useCustomWidth,
    doubleUpscayl,
    scale,
  });

  const sanitizedUpscaledImagePath = useMemo(
    () => sanitizePath(upscaledImagePath),
    [upscaledImagePath],
  );

  const showInformationCard = useMemo(() => {
    if (!batchMode) {
      return imagePath.length === 0 && upscaledImagePath.length === 0;
    } else {
      return (
        batchFolderPath.length === 0 && upscaledBatchFolderPath.length === 0
      );
    }
  }, [
    batchMode,
    imagePath,
    upscaledImagePath,
    batchFolderPath,
    upscaledBatchFolderPath,
  ]);

  // BATCH MODE HANDLERS
  const resetBatchFolderPath = () => {
    setUpscaledBatchFolderPath("");
    setSelectedBatchImage("");
    setBatchFolderPath("");
    setBatchImagePaths([]);
  };

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
    const logit = useLogger();
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
    const file = e.dataTransfer.files[0];
    const filePath = file ? window.electron.getPathForFile(file) : "";

    if (!filePath) {
      logit("👎 No valid files dropped");
      toast(t("Invalid Image"), {
        description: t("Please drag and drop an image"),
      });
      return;
    }

    void importDroppedPath(filePath);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (outputPath) {
      resetImagePaths();
      if (e.clipboardData.files.length) {
        const fileObject = e.clipboardData.files[0];
        const currentDate = new Date(Date.now());
        const currentTime = `${currentDate.getHours()}-${currentDate.getMinutes()}-${currentDate.getSeconds()}`;
        const fileName = `.temp-${currentTime}-${fileObject.name || "image"}`;
        const file = {
          name: fileName,
          path: outputPath,
          extension: fileName.split(".").pop() as ImageFormat,
          size: fileObject.size,
          type: fileObject.type.split("/")[0],
          encodedBuffer: "",
        };

        logit(
          "📋 Pasted file: ",
          JSON.stringify({
            name: file.name,
            path: file.path,
            extension: file.extension,
          }),
        );

        if (
          file.type === "image" &&
          VALID_IMAGE_FORMATS.includes(file.extension)
        ) {
          const reader = new FileReader();
          reader.onload = async (event) => {
            const result = event.target?.result;
            if (typeof result === "string") {
              file.encodedBuffer = Buffer.from(result, "utf-8").toString(
                "base64",
              );
            } else if (result instanceof ArrayBuffer) {
              file.encodedBuffer = Buffer.from(new Uint8Array(result)).toString(
                "base64",
              );
            } else {
              logit("🚫 Invalid file pasted");
              toast(t("Invalid Image"), {
                description: t("No Image file found in Clipboard to paste!"),
              });
            }
            window.electron.send(ELECTRON_COMMANDS.PASTE_IMAGE, file);
          };
          reader.readAsArrayBuffer(fileObject);
        } else {
          logit("🚫 Invalid file pasted");
          toast(t("Invalid Image"), {
            description: t("No Image file found in Clipboard to paste!"),
          });
        }
      } else {
        logit("🚫 Invalid file pasted");
        toast(t("Invalid Image"), {
          description: t("No Image file found in Clipboard to paste!"),
        });
      }
    } else {
      toast(t("Output Folder Required"), {
        description: t("Please select an output folder before starting"),
      });
    }
  };

  useEffect(() => {
    // Events
    const handlePasteEvent = (e) => handlePaste(e);
    const handlePasteImageSaveSuccess = (_: any, imageFilePath: string) => {
      setImagePath(imageFilePath);
      validateImagePath(imageFilePath);
    };
    const handlePasteImageSaveError = (_: any, error: string) => {
      toast(t("No image selected"), {
        description: error,
      });
    };
    window.addEventListener("paste", handlePasteEvent);
    window.electron.on(
      ELECTRON_COMMANDS.PASTE_IMAGE_SAVE_SUCCESS,
      handlePasteImageSaveSuccess,
    );
    window.electron.on(
      ELECTRON_COMMANDS.PASTE_IMAGE_SAVE_ERROR,
      handlePasteImageSaveError,
    );
    return () => {
      window.removeEventListener("paste", handlePasteEvent);
    };
  }, [t, outputPath]);

  // Get image paths within batch folder
  useEffect(() => {
    window.electron.on(
      ELECTRON_COMMANDS.IMAGE_FILES_LIST,
      (_, { images, folderPath }) => {
        if (folderPath !== batchFolderPath) return;

        if (images?.[0].length > 0) setSelectedBatchImage(images[0]);
        setBatchImagePaths(images);
      },
    );

    if (batchFolderPath.length > 0) {
      window.electron.send(ELECTRON_COMMANDS.GET_IMAGE_PATHS, batchFolderPath);
    }
  }, [batchFolderPath]);

  useEffect(() => {
    if (!batchMode) return;

    window.electron.on(
      ELECTRON_COMMANDS.IMAGE_FILES_LIST,
      (_, { images, folderPath }) => {
        if (folderPath !== upscaledBatchFolderPath) return;
        if (!images || images.length === 0) return;

        setUpscayledBatchImagePaths(images);

        // Try to keep the upscayled preview in sync with whatever's selected in the
        // original slider. Fall back to the first matching pair if the current
        // selection has no upscayled counterpart yet.
        const selectedBaseName = getBaseFileName(
          getFilenameFromPath(selectedBatchImage),
        );

        const matchForSelected = selectedBaseName
          ? (images as string[]).find(
              (img) =>
                getBaseFileName(getFilenameFromPath(img)) === selectedBaseName,
            )
          : null;

        if (matchForSelected) setUpscayledSelectedBatchImage(matchForSelected);

        // TODO: Handle failed upscayls — right now a failed image just won't have a
        // matching entry in `images`, so selection can silently fall out of sync.
        // Detect that case and re-sync selectedBatchImage <-> upscayledSelectedBatchImage
        // (or skip to the next successfully upscayled image) instead of leaving stale state.
      },
    );

    if (upscaledBatchFolderPath.length > 0) {
      window.electron.send(
        ELECTRON_COMMANDS.GET_IMAGE_PATHS,
        upscaledBatchFolderPath,
      );
    }
  }, [upscaledBatchFolderPath, selectedBatchImage]);

  useEffect(() => {
    if (!batchMode) {
      resetBatchFolderPath();
    } else if (batchMode && batchImagePaths.length > 0) {
      resetImagePaths();
    }
  }, [batchMode]);

  // Merge original + upscayled image paths by matching base filename
  const batchImageFiles = useMemo(() => {
    const upscaylDone =
      upscayledBatchImagePaths.length === batchImagePaths.length;

    return batchImagePaths.map((image) => {
      const baseName = getBaseFileName(getFilenameFromPath(image));
      const upscayledImage = upscayledBatchImagePaths.find(
        (u) => getBaseFileName(getFilenameFromPath(u)) === baseName,
      );

      return {
        image,
        upscayledImage: upscayledImage ?? null,
        isUpscayled: Boolean(upscayledImage),
        disabled: upscaylDone && !upscayledImage,
      };
    });
  }, [batchImagePaths, upscayledBatchImagePaths]);

  useEffect(() => {
    if (!localStorage.getItem("zoomAmount")) {
      localStorage.setItem("zoomAmount", zoomAmount);
    } else {
      setZoomAmount(localStorage.getItem("zoomAmount"));
    }
  }, []);

  useEffect(() => {
    if (!isBatchSidebarOpen) return;

    function handleKeyDown(e) {
      if (e.key === "Escape") {
        setIsBatchSidebarOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isBatchSidebarOpen]);

  return (
    <div
      className={cn(
        "flex size-full flex-col items-center justify-center gap-2",
        { relative: !maximize },
      )}
    >
      <MacTitlebarDragRegion />
      {/* <MoreOptionsDrawer */}
      {/*   zoomAmount={zoomAmount} */}
      {/*   setZoomAmount={setZoomAmount} */}
      {/*   resetImagePaths={resetImagePaths} */}
      {/* /> */}
      <div className="flex size-full gap-2 overflow-hidden">
        <div className="flex h-full w-full flex-col gap-2 overflow-hidden rounded-4xl border bg-secondary p-2 glass-panel">
          {(selectedBatchImage.length > 0 || imagePath.length > 0) && (
            <div className="inline-flex items-center gap-2">
              <div className="space-y-1.5 px-1.5 text-sm">
                <p className="line-clamp-1 w-full font-semibold">
                  {selectedBatchImage.length > 0
                    ? getFilenameFromPath(selectedBatchImage)
                    : getFilenameFromPath(imagePath)}
                </p>

                {!batchMode && imagePath.length > 0 && (
                  <div className="inline-flex items-center gap-1 text-muted-foreground">
                    <span>{`${dimensions.width}x${dimensions.height}`}</span>
                    <ArrowRightIcon size={16} />
                    {parseInt(scale) >= 6 && (
                      <TriangleAlertIcon
                        size={18}
                        className="fill-yellow-500 stroke-black"
                        data-tooltip-id="tooltip"
                        data-tooltip-content={t(
                          "Anything above 5X may cause performance issues on some devices!",
                        )}
                      />
                    )}
                    <span>{`${upscaylResolution.width}x${upscaylResolution.height} (${scale}x)`}</span>
                  </div>
                )}
              </div>
              <Popover>
                <PopoverTrigger
                  className="ml-auto"
                  disabled={viewType === "lens"}
                  asChild
                >
                  <Button variant="outline">
                    <span>Zoom</span>
                    <span className="ml-3">{zoomAmount}%</span>
                    <ChevronDown />
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
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
                </PopoverContent>
              </Popover>

              {!isBatchSidebarOpen &&
                batchFolderPath.length > 0 &&
                batchImagePaths.length > 0 && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="xl:hidden"
                    onClick={() => setIsBatchSidebarOpen((prev) => !prev)}
                  >
                    <SidebarIcon />
                  </Button>
                )}
            </div>
          )}

          {/* BATCH UPSCALE DONE INFO */}
          {/* {batchMode && upscaledBatchFolderPath.length > 0 && ( */}
          {/*   <div className="z-50 flex flex-col items-center"> */}
          {/*     <p className="text-base-content py-4 font-bold select-none"> */}
          {/*       {t("All done!")} */}
          {/*     </p> */}
          {/*     <button */}
          {/*       className="bg-gradient-blue btn btn-primary rounded-btn p-3 font-medium text-white/90 transition-colors" */}
          {/*       onClick={openFolderHandler} */}
          {/*     > */}
          {/*       {t("Open Upscayled Folder")} */}
          {/*     </button> */}
          {/*   </div> */}
          {/* )} */}

          {/* DEFAULT PANE INFO */}
          {showInformationCard && (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDoubleClick={
                batchMode ? selectFolderHandler : selectImageHandler
              }
              className="size-full"
            >
              <InstructionsCard batchMode={batchMode} />
            </div>
          )}

          <div
            className={cn(maximize ? "absolute inset-0 z-10" : "relative", {
              "h-full overflow-hidden rounded-3xl border bg-card": !batchMode
                ? imagePath.length > 0 || upscaledImagePath.length > 0
                : batchFolderPath.length > 0 && batchImagePaths.length > 0,
            })}
          >
            <ToolBar
              zoomAmount={zoomAmount}
              setZoomAmount={setZoomAmount}
              resetImagePaths={resetImagePaths}
              maximize={maximize}
              setMaximize={setMaximize}
              hasImage={imagePath.length > 0 || selectedBatchImage.length > 0}
              hasUpscayledImage={
                sanitizedUpscaledImagePath.length > 0 ||
                selectedUpscayldBatchImage.length > 0
              }
            />

            {/* BATCH UPSCALE SHOW SELECTED FOLDER */}
            {selectedBatchImage.length > 0 &&
              upscaledBatchFolderPath.length === 0 &&
              batchFolderPath.length > 0 && (
                <ImageViewer
                  imagePath={selectedBatchImage}
                  setDimensions={setDimensions}
                  zoomAmount={zoomAmount}
                />
              )}

            {/* SHOW SELECTED IMAGE */}
            {!batchMode &&
              upscaledImagePath.length === 0 &&
              imagePath.length > 0 && (
                <ImageViewer
                  imagePath={imagePath}
                  setDimensions={setDimensions}
                  zoomAmount={zoomAmount}
                />
              )}

            {/* COMPARISON SLIDER */}
            {!batchMode &&
              viewType === "slider" &&
              imagePath.length > 0 &&
              upscaledImagePath.length > 0 && (
                <SliderView
                  sanitizedImagePath={sanitizedImagePath}
                  sanitizedUpscaledImagePath={sanitizedUpscaledImagePath}
                  zoomAmount={zoomAmount}
                  beforeSize={`${dimensions.width} x ${dimensions.height}`}
                  afterSize={`${upscaylResolution.width} x ${upscaylResolution.height}`}
                  isMaximized={maximize}
                  scale={scale}
                />
              )}

            {/* BATCH COMPARISON SLIDER */}
            {batchMode &&
              viewType === "slider" &&
              selectedBatchImage.length > 0 &&
              selectedUpscayldBatchImage.length > 0 && (
                <SliderView
                  sanitizedImagePath={sanitizePath(selectedBatchImage)}
                  sanitizedUpscaledImagePath={sanitizePath(
                    selectedUpscayldBatchImage,
                  )}
                  zoomAmount={zoomAmount}
                  beforeSize={""}
                  afterSize={""}
                  isMaximized={maximize}
                  scale={""}
                />
              )}

            {progress.length > 0 &&
              upscaledImagePath.length === 0 &&
              upscaledBatchFolderPath.length === 0 && (
                <ProgressBar
                  batchMode={batchMode}
                  progress={progress}
                  doubleUpscaylCounter={doubleUpscaylCounter}
                  resetImagePaths={resetImagePaths}
                />
              )}

            {!batchMode &&
              viewType === "lens" &&
              upscaledImagePath &&
              imagePath && (
                <LensViewer
                  sanitizedImagePath={sanitizedImagePath}
                  sanitizedUpscaledImagePath={sanitizedUpscaledImagePath}
                />
              )}

            {batchMode &&
              viewType === "lens" &&
              selectedBatchImage.length > 0 &&
              selectedUpscayldBatchImage.length > 0 && (
                <LensViewer
                  sanitizedImagePath={sanitizePath(selectedBatchImage)}
                  sanitizedUpscaledImagePath={sanitizePath(
                    selectedUpscayldBatchImage,
                  )}
                />
              )}
          </div>
        </div>
        {batchFolderPath.length > 0 && batchImagePaths.length > 0 && (
          <>
            {isBatchSidebarOpen && (
              <div
                className="fixed inset-0 z-10 cursor-pointer"
                onClick={() => setIsBatchSidebarOpen(false)}
              ></div>
            )}
            <div
              className={cn(
                "absolute top-0 right-0 z-20 flex h-full w-48 shrink-0 flex-col gap-3 rounded-4xl border bg-secondary p-3 transition-transform xl:relative",
                isBatchSidebarOpen
                  ? "translate-x-0"
                  : "translate-x-[110%] xl:translate-x-0",
              )}
            >
              <div className="relative inline-flex items-center justify-between text-sm">
                {isBatchSidebarOpen && (
                  <Button
                    size="icon"
                    variant="outline"
                    className="absolute -left-14 xl:hidden"
                    onClick={() => setIsBatchSidebarOpen((prev) => !prev)}
                  >
                    <SidebarIcon />
                  </Button>
                )}
                <div className="inline-flex items-center gap-1 pl-1 text-xs font-medium">
                  <span className="flex items-center justify-center rounded-full bg-foreground/10 px-2 py-1">
                    {batchImagePaths.length} images
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="xs"
                  type="button"
                  onClick={resetBatchFolderPath}
                >
                  Clear All
                </Button>
              </div>
              <div className="h-full w-full scrollbar-none gap-2 space-y-3 overflow-y-auto">
                {batchImageFiles.map((batch, index) => {
                  return (
                    <div
                      key={`${componentId}-${index}`}
                      aria-disabled={batch.disabled}
                      onClick={(e) => {
                        e.preventDefault();
                        if (batch.disabled || progress.length > 0) return;

                        setSelectedBatchImage(batch.image);

                        if (batch.isUpscayled && batch.upscayledImage) {
                          setUpscayledSelectedBatchImage(batch.upscayledImage);
                        }
                      }}
                      className={cn(
                        "group relative aspect-square overflow-hidden rounded-xl border-2 bg-secondary p-1 transition-all duration-200 ease-out",
                        selectedBatchImage === batch.image && "border-white",
                        batch.disabled
                          ? "cursor-not-allowed opacity-40 grayscale"
                          : "cursor-pointer",
                      )}
                    >
                      {progress.length > 0 && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                          <LoaderCircle className="animate-spin" />
                        </div>
                      )}
                      <ImageViewer
                        imagePath={batch.image}
                        setDimensions={setDimensions}
                        className="rounded-lg object-cover"
                      />
                    </div>
                  );
                })}
              </div>
              {batchMode && upscaledBatchFolderPath.length > 0 && (
                <div className="flex w-full flex-col items-center justify-center gap-3">
                  <p className="sr-only">{t("All done!")}</p>
                  <Button onClick={openFolderHandler} className="w-full">
                    <FolderOpenIcon />
                    {t("Open Upscayled Folder")}
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MainContent;
