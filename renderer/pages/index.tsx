"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import COMMAND from "../../common/commands";
import { ReactCompareSlider } from "react-compare-slider";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ProgressBar from "../components/upscayl-tab/view/ProgressBar";
import RightPaneInfo from "../components/upscayl-tab/view/RightPaneInfo";
import ImageOptions from "../components/upscayl-tab/view/ImageOptions";
import LeftPaneImageSteps from "../components/upscayl-tab/config/LeftPaneImageSteps";
import Tabs from "../components/Tabs";
import SettingsTab from "../components/settings-tab";
import { useAtom, useAtomValue } from "jotai";
import { logAtom } from "../atoms/logAtom";
import { modelsListAtom } from "../atoms/modelsListAtom";
import {
  batchModeAtom,
  lensSizeAtom,
  compressionAtom,
  dontShowCloudModalAtom,
  noImageProcessingAtom,
  savedOutputPathAtom,
  overwriteAtom,
  progressAtom,
  scaleAtom,
  viewTypeAtom,
  rememberOutputFolderAtom,
  showSidebarAtom,
  customWidthAtom,
  useCustomWidthAtom,
  tileSizeAtom,
} from "../atoms/userSettingsAtom";
import useLog from "../components/hooks/useLog";
import { UpscaylCloudModal } from "../components/UpscaylCloudModal";
import { featureFlags } from "@common/feature-flags";
import {
  BatchUpscaylPayload,
  DoubleUpscaylPayload,
  ImageUpscaylPayload,
} from "@common/types/types";
import { NewsModal } from "@/components/NewsModal";
import { newsAtom, showNewsModalAtom } from "@/atoms/newsAtom";
import matter from "gray-matter";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import Logo from "@/components/icons/Logo";
import { sanitizePath } from "@common/sanitize-path";
import getDirectoryFromPath from "@common/get-directory-from-path";
import { translationAtom } from "@/atoms/translations-atom";
import getFilenameFromPath from "@/../common/get-file-name";
import { parse } from "path";

const Home = () => {
  const allowedFileTypes = ["png", "jpg", "jpeg", "webp"];

  const t = useAtomValue(translationAtom);

  // LOCAL STATES
  const [os, setOs] = useState<"linux" | "mac" | "win" | undefined>(undefined);
  const [imagePath, setImagePath] = useState("");
  const [upscaledImagePath, setUpscaledImagePath] = useState("");
  const [upImgPathLog, setupImgPathLog] = useState<string[]>([]);
  const [srcFilename, setSrcFilename] = useState("");
  const [model, setModel] = useState("realesrgan-x4plus");
  const [version, setVersion] = useState("");
  const [batchFolderPath, setBatchFolderPath] = useState("");
  const [doubleUpscayl, setDoubleUpscayl] = useState(false);
  const overwrite = useAtomValue(overwriteAtom);
  const [upscaledBatchFolderPath, setUpscaledBatchFolderPath] = useState("");
  const [doubleUpscaylCounter, setDoubleUpscaylCounter] = useState(0);
  const [gpuId, setGpuId] = useState("");
  const [saveImageAs, setSaveImageAs] = useState("png");
  const [zoomAmount, setZoomAmount] = useState("100");
  const [backgroundPosition, setBackgroundPosition] = useState("0% 0%");
  const [dimensions, setDimensions] = useState({
    width: null,
    height: null,
  });
  const [selectedTab, setSelectedTab] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showCloudModal, setShowCloudModal] = useState(false);
  const [minSize, setMinSize] = useState(22);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  // ATOMIC STATES
  const [outputPath, setOutputPath] = useAtom(savedOutputPathAtom);
  const [compression, setCompression] = useAtom(compressionAtom);
  const [progress, setProgress] = useAtom(progressAtom);
  const [batchMode, setBatchMode] = useAtom(batchModeAtom);
  const [logData, setLogData] = useAtom(logAtom);
  const [modelOptions, setModelOptions] = useAtom(modelsListAtom);
  const [scale] = useAtom(scaleAtom);
  const [dontShowCloudModal, setDontShowCloudModal] = useAtom(
    dontShowCloudModalAtom,
  );
  const noImageProcessing = useAtomValue(noImageProcessingAtom);
  const [news, setNews] = useAtom(newsAtom);
  const [showNewsModal, setShowNewsModal] = useAtom(showNewsModalAtom);
  const viewType = useAtomValue(viewTypeAtom);
  const lensSize = useAtomValue(lensSizeAtom);
  const rememberOutputFolder = useAtomValue(rememberOutputFolderAtom);
  const [showSidebar, setShowSidebar] = useAtom(showSidebarAtom);
  const customWidth = useAtomValue(customWidthAtom);
  const useCustomWidth = useAtomValue(useCustomWidthAtom);
  const tileSize = useAtomValue(tileSizeAtom);

  const { logit } = useLog();
  const { toast } = useToast();

  const sanitizedImagePath = useMemo(
    () => sanitizePath(imagePath),
    [imagePath],
  );

  const sanitizedUpscaledImagePath = useMemo(
    () => sanitizePath(upscaledImagePath),
    [upscaledImagePath],
  );

  const handleMouseMoveCompare = (e: React.MouseEvent) => {
    const { left, top, height, width } =
      e.currentTarget.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    setCursorPosition({ x, y });
    const xZoom = ((e.pageX - left) / width) * 100;
    const yZoom = ((e.pageY - top) / height) * 100;
    setBackgroundPosition(`${xZoom}% ${yZoom}%`);
  };

  const handleUpImgPathLog = async (
    srcFilename: string,
    datafullPath: string,
    typeEvent: string,
  ) => {
    if (!batchMode) {
      const srcFile = parse(srcFilename).name;
      let outFile = getFilenameFromPath(datafullPath);

      // State for filename, passed to component "PreviousRenders"
      setSrcFilename(srcFile);

      let allRenders =
        JSON.parse(localStorage.getItem(`prevRenders:${srcFile}`)) || [];

      if (typeEvent === "upscale") {
        const currModel = JSON.parse(localStorage.getItem("model")).label;
        if (
          allRenders.length === 0 ||
          !allRenders.some((el) => el.srcFile === outFile)
        ) {
          // Append the new image
          allRenders.push({ srcFile: outFile, modelUsed: currModel });
        }
      } else if (typeEvent === "delete") {
        // Delete selected element
        allRenders = allRenders.filter((el) => el.srcFile !== outFile);
      }
      setupImgPathLog(allRenders);

      if (typeEvent === "upscale" || typeEvent === "delete") {
        if (allRenders.length === 0) {
          localStorage.removeItem(`prevRenders:${srcFile}`);
        } else {
          localStorage.setItem(
            `prevRenders:${srcFile}`,
            JSON.stringify(allRenders),
          );
        }
      }
    }
  };

  // SET CONFIG VARIABLES ON FIRST RUN
  useEffect(() => {
    // UPSCAYL VERSION
    const upscaylVersion = navigator?.userAgent?.match(
      /Upscayl\/([\d\.]+\d+)/,
    )[1];
    setVersion(upscaylVersion);
  }, []);

  // ELECTRON EVENT LISTENERS
  useEffect(() => {
    const handleErrors = (data: string) => {
      if (data.includes("Invalid GPU")) {
        toast({
          title: t("ERRORS.GPU_ERROR.TITLE"),
          description: t("ERRORS.GPU_ERROR.DESCRIPTION", { data }),
          action: (
            <div className="flex flex-col gap-2">
              <ToastAction
                altText={t("ERRORS.COPY_ERROR.TITLE")}
                onClick={() => {
                  navigator.clipboard.writeText(data);
                }}
              >
                {t("ERRORS.COPY_ERROR.TITLE")}
              </ToastAction>
              <a href="https://docs.upscayl.org/" target="_blank">
                <ToastAction altText={t("ERRORS.OPEN_DOCS_TITLE")}>
                  {t("ERRORS.OPEN_DOCS_BUTTON_TITLE")}
                </ToastAction>
              </a>
            </div>
          ),
        });
        resetImagePaths();
      } else if (data.includes("write") || data.includes("read")) {
        if (batchMode) return;
        toast({
          title: t("ERRORS.READ_WRITE_ERROR.TITLE"),
          description: t("ERRORS.READ_WRITE_ERROR.DESCRIPTION", { data }),
          action: (
            <div className="flex flex-col gap-2">
              <ToastAction
                altText="Copy Error"
                onClick={() => {
                  navigator.clipboard.writeText(data);
                }}
              >
                {t("ERRORS.COPY_ERROR.TITLE")}
              </ToastAction>
              <a href="https://docs.upscayl.org/" target="_blank">
                <ToastAction altText={t("ERRORS.OPEN_DOCS_TITLE")}>
                  {t("ERRORS.OPEN_DOCS_BUTTON_TITLE")}
                </ToastAction>
              </a>
            </div>
          ),
        });
        resetImagePaths();
      } else if (data.includes("tile size")) {
        toast({
          title: t("ERRORS.TILE_SIZE_ERROR.TITLE"),
          description: t("ERRORS.TILE_SIZE_ERROR.DESCRIPTION", { data }),
        });
        resetImagePaths();
      } else if (data.includes("uncaughtException")) {
        toast({
          title: t("ERRORS.EXCEPTION_ERROR.TITLE"),
          description: t("ERRORS.EXCEPTION_ERROR.DESCRIPTION"),
        });
        resetImagePaths();
      }
    };
    // OS
    window.electron.on(
      COMMAND.OS,
      (_, data: "linux" | "mac" | "win" | undefined) => {
        if (data) {
          setOs(data);
        }
      },
    );
    // LOG
    window.electron.on(COMMAND.LOG, (_, data: string) => {
      logit(`🎒 BACKEND REPORTED: `, data);
    });
    // SCALING AND CONVERTING
    window.electron.on(COMMAND.SCALING_AND_CONVERTING, (_, data: string) => {
      setProgress(t("APP.PROGRESS.PROCESSING_TITLE"));
    });
    // UPSCAYL ERROR
    window.electron.on(COMMAND.UPSCAYL_ERROR, (_, data: string) => {
      toast({
        title: t("ERRORS.GENERIC_ERROR.TITLE"),
        description: data,
      });
      resetImagePaths();
    });
    // UPSCAYL PROGRESS
    window.electron.on(COMMAND.UPSCAYL_PROGRESS, (_, data: string) => {
      if (data.length > 0 && data.length < 10) {
        setProgress(data);
      } else if (data.includes("converting")) {
        setProgress(t("APP.PROGRESS.SCALING_CONVERTING_TITLE"));
      } else if (data.includes("Successful")) {
        setProgress(t("APP.PROGRESS.SUCCESS_TITLE"));
      }
      handleErrors(data);
      logit(`🚧 UPSCAYL_PROGRESS: `, data);
    });
    // FOLDER UPSCAYL PROGRESS
    window.electron.on(COMMAND.FOLDER_UPSCAYL_PROGRESS, (_, data: string) => {
      if (data.includes("Successful")) {
        setProgress(t("APP.PROGRESS.SUCCESS_TITLE"));
      }
      if (data.length > 0 && data.length < 10) {
        setProgress(data);
      }
      handleErrors(data);
      logit(`🚧 FOLDER_UPSCAYL_PROGRESS: `, data);
    });
    // DOUBLE UPSCAYL PROGRESS
    window.electron.on(COMMAND.DOUBLE_UPSCAYL_PROGRESS, (_, data: string) => {
      if (data.length > 0 && data.length < 10) {
        if (data === "0.00%") {
          setDoubleUpscaylCounter(doubleUpscaylCounter + 1);
        }
        setProgress(data);
      }
      handleErrors(data);
      logit(`🚧 DOUBLE_UPSCAYL_PROGRESS: `, data);
    });
    // UPSCAYL DONE
    window.electron.on(COMMAND.UPSCAYL_DONE, (_, { fileName, data }) => {
      setProgress("");
      setUpscaledImagePath(data);
      // Previous renders history
      handleUpImgPathLog(fileName, data, "upscale");
      logit("upscaledImagePath: ", data);
      logit(`💯 UPSCAYL_DONE: `, data);
    });
    // FOLDER UPSCAYL DONE
    window.electron.on(COMMAND.FOLDER_UPSCAYL_DONE, (_, data: string) => {
      setProgress("");
      setUpscaledBatchFolderPath(data);
      logit(`💯 FOLDER_UPSCAYL_DONE: `, data);
    });
    // DOUBLE UPSCAYL DONE
    window.electron.on(COMMAND.DOUBLE_UPSCAYL_DONE, (_, { fileName, data }) => {
      setProgress("");
      setTimeout(() => setUpscaledImagePath(data), 500);
      setDoubleUpscaylCounter(0);
      // Previous renders history
      handleUpImgPathLog(fileName, data, "upscale");
      logit(`💯 DOUBLE_UPSCAYL_DONE: `, data);
    });
    // CUSTOM FOLDER LISTENER
    window.electron.on(COMMAND.CUSTOM_MODEL_FILES_LIST, (_, data: string[]) => {
      logit(`📜 CUSTOM_MODEL_FILES_LIST: `, data);
      const newModelOptions = data.map((model) => {
        return {
          value: model,
          label: model,
        };
      });
      // Add newModelsList to modelOptions and remove duplicates
      const combinedModelOptions = [...modelOptions, ...newModelOptions];
      const uniqueModelOptions = combinedModelOptions.filter(
        // Check if any model in the array appears more than once
        (model, index, array) =>
          array.findIndex((t) => t.value === model.value) === index,
      );
      setModelOptions(uniqueModelOptions);
    });
  }, []);

  // FETCH CUSTOM MODELS FROM CUSTOM MODELS PATH
  useEffect(() => {
    const customModelsPath = JSON.parse(
      localStorage.getItem("customModelsPath"),
    );
    if (customModelsPath !== null) {
      window.electron.send(COMMAND.GET_MODELS_LIST, customModelsPath);
      logit("🎯 GET_MODELS_LIST: ", customModelsPath);
    }
  }, []);

  // FETCH NEWS
  useEffect(() => {
    // TODO: ADD AN ABOUT TAB
    if (window && window.navigator.onLine === false) return;
    try {
      fetch("https://raw.githubusercontent.com/upscayl/upscayl/main/news.md", {
        cache: "no-cache",
      })
        .then((res) => {
          return res.text();
        })
        .then((result) => {
          const newsData = result;
          if (!newsData) {
            console.log("📰 Could not fetch news data");
            return;
          }
          const markdownData = matter(newsData);
          if (!markdownData) return;
          if (markdownData && markdownData.data.dontShow) {
            return;
          }
          if (
            markdownData &&
            news &&
            markdownData?.data?.version === news?.data?.version
          ) {
            console.log("📰 News is up to date");
            if (showNewsModal === false) {
              setShowNewsModal(false);
            }
          } else if (markdownData) {
            setNews(matter(newsData));
            setShowNewsModal(true);
          }
        });
    } catch (error) {
      console.log("Could not fetch Upscayl News");
    }
  }, [news]);

  // LOADING STATE
  useEffect(() => {
    setIsLoading(false);
  }, []);

  // HANDLERS
  const resetImagePaths = () => {
    logit("🔄 Resetting image paths");
    setDimensions({
      width: null,
      height: null,
    });
    setProgress("");
    setImagePath("");
    setUpscaledImagePath("");
    setBatchFolderPath("");
    setUpscaledBatchFolderPath("");
  };

  // UTILS
  // CHECK IF IMAGE IS VALID
  const validateImagePath = (path: string) => {
    if (path.length > 0) {
      logit("🖼 imagePath: ", path);
      const extension = path.toLocaleLowerCase().split(".").pop();
      logit("🔤 Extension: ", extension);
      if (!allowedFileTypes.includes(extension.toLowerCase())) {
        toast({
          title: t("ERRORS.INVALID_IMAGE_ERROR.TITLE"),
          description: t("ERRORS.INVALID_IMAGE_ERROR.DESCRIPTION"),
        });
        resetImagePaths();
      }
    } else {
      resetImagePaths();
    }
  };

  // HANDLERS
  const handleMouseMove = useCallback((e: any) => {
    const { left, top, width, height } = e.target.getBoundingClientRect();
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top) / height) * 100;
    setBackgroundPosition(`${x}% ${y}%`);
  }, []);

  const selectImageHandler = async () => {
    resetImagePaths();
    // RAZ Previous renders history
    setupImgPathLog([]);
    var path = await window.electron.invoke(COMMAND.SELECT_FILE);
    if (path === null) return;
    logit("🖼 Selected Image Path: ", path);
    setImagePath(path);
    var dirname = getDirectoryFromPath(path);
    var filename = getFilenameFromPath(path);
    logit("📁 Selected Image Directory: ", dirname);
    if (!featureFlags.APP_STORE_BUILD) {
      if (!rememberOutputFolder) {
        setOutputPath(dirname);
      }
    }
    validateImagePath(path);
    // Load previous renders
    handleUpImgPathLog(filename, path, "loadImg");
  };

  const selectFolderHandler = async () => {
    resetImagePaths();
    var path = await window.electron.invoke(COMMAND.SELECT_FOLDER);
    if (path !== null) {
      logit("🖼 Selected Folder Path: ", path);
      setBatchFolderPath(path);
      if (!rememberOutputFolder) {
        setOutputPath(path);
      }
    } else {
      logit("🚫 Folder selection cancelled");
      setBatchFolderPath("");
      if (!rememberOutputFolder) {
        setOutputPath("");
      }
    }
  };

  const handleModelChange = (e: any) => {
    setModel(e.value);
    logit("🔀 Model changed: ", e.value);
    localStorage.setItem(
      "model",
      JSON.stringify({ label: e.label, value: e.value }),
    );
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
    logit("📂 OPEN_FOLDER: ", upscaledBatchFolderPath);
    window.electron.send(COMMAND.OPEN_FOLDER, upscaledBatchFolderPath);
  };

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
      !allowedFileTypes.includes(extension.toLowerCase())
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
      if (!featureFlags.APP_STORE_BUILD) {
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
      !allowedFileTypes.includes(extension.toLowerCase())
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

  const upscaylHandler = async () => {
    logit("🔄 Resetting Upscaled Image Path");
    setUpscaledImagePath("");
    setUpscaledBatchFolderPath("");
    if (imagePath !== "" || batchFolderPath !== "") {
      setProgress(t("APP.PROGRESS.WAIT_TITLE"));
      // Double Upscayl
      if (doubleUpscayl) {
        window.electron.send<DoubleUpscaylPayload>(COMMAND.DOUBLE_UPSCAYL, {
          imagePath,
          outputPath,
          model,
          gpuId: gpuId.length === 0 ? null : gpuId,
          saveImageAs,
          scale,
          noImageProcessing,
          compression: compression.toString(),
          customWidth: customWidth > 0 ? customWidth.toString() : null,
          useCustomWidth,
          tileSize,
        });
        logit("🏁 DOUBLE_UPSCAYL");
      } else if (batchMode) {
        // Batch Upscayl
        setDoubleUpscayl(false);
        window.electron.send<BatchUpscaylPayload>(COMMAND.FOLDER_UPSCAYL, {
          batchFolderPath,
          outputPath,
          model,
          gpuId: gpuId.length === 0 ? null : gpuId,
          saveImageAs,
          scale,
          noImageProcessing,
          compression: compression.toString(),
          customWidth: customWidth > 0 ? customWidth.toString() : null,
          useCustomWidth,
          tileSize,
        });
        logit("🏁 FOLDER_UPSCAYL");
      } else {
        // Single Image Upscayl
        window.electron.send<ImageUpscaylPayload>(COMMAND.UPSCAYL, {
          imagePath,
          outputPath,
          model,
          gpuId: gpuId.length === 0 ? null : gpuId,
          saveImageAs,
          scale,
          overwrite,
          noImageProcessing,
          compression: compression.toString(),
          customWidth: customWidth > 0 ? customWidth.toString() : null,
          useCustomWidth,
          tileSize,
        });
        logit("🏁 UPSCAYL");
      }
    } else {
      toast({
        title: t("ERRORS.NO_IMAGE_ERROR.TITLE"),
        description: t("ERRORS.NO_IMAGE_ERROR.DESCRIPTION"),
      });
      logit("🚫 No valid image selected");
    }
  };

  const stopHandler = () => {
    window.electron.send(COMMAND.STOP);
    logit("🛑 Stopping Upscayl");
    resetImagePaths();
  };

  if (isLoading) {
    return (
      <Logo className="absolute left-1/2 top-1/2 w-36 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
    );
  }

  return (
    <div className="flex h-screen w-screen flex-row overflow-hidden bg-base-300">
      {/* TOP LOGO WHEN SIDEBAR IS HIDDEN */}
      {!showSidebar && (
        <div className="fixed right-2 top-2 z-50 flex items-center justify-center gap-2 rounded-[7px] bg-base-300 px-2 py-1 font-medium text-base-content ">
          <Logo className="w-5" />
          {t("TITLE")}
        </div>
      )}

      {/* SIDEBAR BUTTON */}
      <button
        className={cn(
          "fixed left-0 top-1/2 z-[999] -translate-y-1/2 rounded-r-full bg-base-100 p-4 ",
          showSidebar ? "hidden" : "",
        )}
        onClick={() => setShowSidebar((prev) => !prev)}
      >
        <ChevronRightIcon />
      </button>

      {/* LEFT PANE */}
      <div
        className={`relative flex h-screen min-w-[350px] max-w-[350px] flex-col bg-base-100 ${showSidebar ? "" : "hidden"}`}
      >
        <button
          className="absolute -right-0 top-1/2 z-[999] -translate-y-1/2 translate-x-1/2 rounded-full bg-base-100 p-4"
          onClick={() => setShowSidebar((prev) => !prev)}
        >
          <ChevronLeftIcon />
        </button>

        {/* UPSCAYL CLOUD MODAL */}
        {featureFlags.SHOW_UPSCAYL_CLOUD_INFO && (
          <UpscaylCloudModal
            show={showCloudModal}
            setShow={setShowCloudModal}
            setDontShowCloudModal={setDontShowCloudModal}
          />
        )}
        {/* MACOS TITLEBAR */}
        {window.electron.platform === "mac" && (
          <div className="mac-titlebar pt-8"></div>
        )}
        {/* HEADER */}
        <Header version={version} />
        {!dontShowCloudModal && featureFlags.SHOW_UPSCAYL_CLOUD_INFO && (
          <button
            className="mx-5 mb-5 animate-pulse rounded-btn bg-success p-1 text-sm text-slate-50 shadow-lg shadow-success/40"
            onClick={() => {
              setShowCloudModal(true);
            }}
          >
            {t("INTRO")}
          </button>
        )}

        {/* NEWS DIALOG */}
        <NewsModal
          show={showNewsModal}
          setShow={(val: boolean) => {
            setShowNewsModal(val);
            setNews((prev) => ({ ...prev, seen: true }));
          }}
          news={news}
        />

        <Tabs selectedTab={selectedTab} setSelectedTab={setSelectedTab} />

        {selectedTab === 0 && (
          <LeftPaneImageSteps
            selectImageHandler={selectImageHandler}
            selectFolderHandler={selectFolderHandler}
            handleModelChange={handleModelChange}
            upscaylHandler={upscaylHandler}
            batchMode={batchMode}
            setBatchMode={setBatchMode}
            imagePath={imagePath}
            doubleUpscayl={doubleUpscayl}
            setDoubleUpscayl={setDoubleUpscayl}
            dimensions={dimensions}
            setGpuId={setGpuId}
            model={model}
            setModel={setModel}
            setSaveImageAs={setSaveImageAs}
          />
        )}

        {selectedTab === 1 && (
          <SettingsTab
            batchMode={batchMode}
            setModel={setModel}
            compression={compression}
            setCompression={setCompression}
            gpuId={gpuId}
            setGpuId={setGpuId}
            saveImageAs={saveImageAs}
            setSaveImageAs={setSaveImageAs}
            logData={logData}
            os={os}
            show={showCloudModal}
            setShow={setShowCloudModal}
            setDontShowCloudModal={setDontShowCloudModal}
          />
        )}
        {/* )} */}
        <Footer />
      </div>

      {/* RIGHT PANE */}
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
        {!batchMode &&
          upscaledImagePath.length === 0 &&
          imagePath.length > 0 && (
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
          upImgPath={upImgPathLog}
          upscaylHandler={upscaylHandler}
          srcFilename={srcFilename}
          setUpscaledImagePath={setUpscaledImagePath}
          outputPath={outputPath}
          handleUpImgPathLog={handleUpImgPathLog}
        />
        {!batchMode &&
          viewType === "lens" &&
          upscaledImagePath &&
          imagePath && (
            <div
              className="group relative h-full w-full overflow-hidden"
              onMouseMove={handleMouseMoveCompare}
            >
              <img
                className={`absolute left-0 top-0 h-full w-full object-contain transition-transform group-hover:scale-[${
                  zoomAmount + "%"
                }]`}
                src={"file:///" + imagePath}
                style={{
                  backgroundPosition: "0% 0%",
                  transformOrigin: backgroundPosition,
                }}
              />
              <div
                className={`invisible absolute left-0 top-0 h-full w-full bg-white mix-blend-difference group-hover:visible group-hover:scale-[${
                  zoomAmount + "%"
                }]`}
                style={{
                  clipPath: `circle(${
                    (lensSize + 2 * (parseInt(zoomAmount) / 100)) /
                    (parseInt(zoomAmount) / 100)
                  }px at ${cursorPosition.x}px ${cursorPosition.y}px)`,
                  backgroundPosition: "0% 0%",
                  transformOrigin: backgroundPosition,
                }}
              />
              <img
                className={`absolute h-full w-full object-contain transition-transform group-hover:scale-[${
                  zoomAmount + "%"
                }]`}
                src={"file:///" + upscaledImagePath}
                style={{
                  clipPath: `circle(${
                    (lensSize + parseInt(zoomAmount) / 100) /
                    (parseInt(zoomAmount) / 100)
                  }px at ${cursorPosition.x}px ${cursorPosition.y}px)`,
                  backgroundPosition: backgroundPosition,
                  transformOrigin: backgroundPosition,
                }}
              />
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
                      {/* {t("APP.SLIDER.UPSCAYLED_TITLE")} */}
                      {`${sanitizedUpscaledImagePath.replace(/^.*[\\/]/, "")}`}
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
    </div>
  );
};

export default Home;
