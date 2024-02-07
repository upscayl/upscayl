"use client";
import { useState, useEffect, useCallback, useRef } from "react";
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
  outputPathAtom,
  overwriteAtom,
  progressAtom,
  scaleAtom,
  viewTypeAtom,
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

const Home = () => {
  const allowedFileTypes = ["png", "jpg", "jpeg", "webp"];

  // LOCAL STATES
  const [os, setOs] = useState<"linux" | "mac" | "win" | undefined>(undefined);
  const [imagePath, setImagePath] = useState("");
  const [upscaledImagePath, setUpscaledImagePath] = useState("");
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

  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  // ATOMIC STATES
  const [outputPath, setOutputPath] = useAtom(outputPathAtom);
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

  const { logit } = useLog();

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
      if (data.includes("invalid gpu")) {
        alert(
          "Error. Please make sure you have a Vulkan compatible GPU (Most modern GPUs support Vulkan). Upscayl does not work with CPU or iGPU sadly.",
        );
        resetImagePaths();
      } else if (data.includes("failed")) {
        if (batchMode) return;
        alert(
          data.includes("encode")
            ? `ENCODING ERROR: ${data}. For troubleshooting, please read the Upscayl Wiki.`
            : `DECODING ERROR: ${data}. Additional Info: This image is possibly corrupt or not supported by Upscayl, or your GPU drivers are acting funny (PLEASE READ THE UPSCAYL WIKI). You could try converting the image into another format and upscaling again. Also make sure that the output path is correct and you have the proper write permissions for the directory. If not, then unfortunately there's not much we can do to help, sorry.`,
        );
        resetImagePaths();
      } else if (data.includes("uncaughtException")) {
        alert(
          "Upscayl encountered an error. Possibly, the upscayl binary failed to execute the commands properly. Try checking the logs to see if you get any information. You can post an issue on Upscayl's GitHub repository for more help.",
        );
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
      logit(`🐞 BACKEND REPORTED: `, data);
    });
    // SCALING AND CONVERTING
    window.electron.on(COMMAND.SCALING_AND_CONVERTING, (_, data: string) => {
      setProgress("Processing the image...");
    });
    // UPSCAYL ERROR
    window.electron.on(COMMAND.UPSCAYL_ERROR, (_, data: string) => {
      alert(data);
      resetImagePaths();
    });
    // UPSCAYL PROGRESS
    window.electron.on(COMMAND.UPSCAYL_PROGRESS, (_, data: string) => {
      if (data.length > 0 && data.length < 10) {
        setProgress(data);
      } else if (data.includes("converting")) {
        setProgress("Scaling and converting image...");
      } else if (data.includes("Successful")) {
        setProgress("Upscayl Successful!");
      }
      handleErrors(data);
      logit(`🚧 UPSCAYL_PROGRESS: `, data);
    });
    // FOLDER UPSCAYL PROGRESS
    window.electron.on(COMMAND.FOLDER_UPSCAYL_PROGRESS, (_, data: string) => {
      if (data.includes("Successful")) {
        setProgress("Upscayl Successful!");
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
    window.electron.on(COMMAND.UPSCAYL_DONE, (_, data: string) => {
      setProgress("");
      setUpscaledImagePath(data);
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
    window.electron.on(COMMAND.DOUBLE_UPSCAYL_DONE, (_, data: string) => {
      setProgress("");
      setTimeout(() => setUpscaledImagePath(data), 500);
      setDoubleUpscaylCounter(0);
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

  // CONFIGURE SAVED OUTPUT PATH
  useEffect(() => {
    const rememberOutputFolder = localStorage.getItem("rememberOutputFolder");
    const lastOutputFolderPath = localStorage.getItem("lastOutputFolderPath");
    if (rememberOutputFolder === "true") {
      logit("🧠 Recalling Output Folder: ", lastOutputFolderPath);
      setOutputPath(lastOutputFolderPath);
    } else {
      setOutputPath("");
      localStorage.removeItem("lastOutputFolderPath");
    }
  }, []);

  // LOADING STATE
  useEffect(() => {
    setIsLoading(false);
  }, []);

  // * HANDLERS
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
        alert("Please select an image");
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
    var path = await window.electron.invoke(COMMAND.SELECT_FILE);
    if (path === null) return;
    logit("🖼 Selected Image Path: ", path);
    setImagePath(path);
    var dirname = path.match(/(.*)[\/\\]/)[1] || "";
    logit("📁 Selected Image Directory: ", dirname);
    if (!featureFlags.APP_STORE_BUILD) {
      setOutputPath(dirname);
    }
    validateImagePath(path);
  };

  const selectFolderHandler = async () => {
    resetImagePaths();
    var path = await window.electron.invoke(COMMAND.SELECT_FOLDER);
    if (path !== null) {
      logit("🖼 Selected Folder Path: ", path);
      setBatchFolderPath(path);
      setOutputPath(path);
    } else {
      logit("🚫 Folder selection cancelled");
      setBatchFolderPath("");
      setOutputPath("");
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
      alert("Please drag and drop an image");
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
      alert("Please drag and drop an image");
    } else {
      logit("🖼 Setting image path: ", filePath);
      setImagePath(filePath);
      var dirname = filePath.match(/(.*)[\/\\]/)[1] || "";
      logit("🗂 Setting output path: ", dirname);
      if (!featureFlags.APP_STORE_BUILD) setOutputPath(dirname);
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
      alert("Please drag and drop an image");
    } else {
      setImagePath(filePath);
      var dirname = filePath.match(/(.*)[\/\\]/)[1] || "";
      logit("🗂 Setting output path: ", dirname);
      setOutputPath(dirname);
    }
  };

  const outputHandler = async () => {
    var path = await window.electron.invoke(COMMAND.SELECT_FOLDER);
    if (path !== null) {
      logit("🗂 Setting Output Path: ", path);
      setOutputPath(path);
      const rememberOutputFolder = localStorage.getItem("rememberOutputFolder");
      if (rememberOutputFolder) {
        logit("🧠 Remembering Output Folder: ", path);
        localStorage.setItem("lastOutputFolderPath", path);
      }
    } else {
      setOutputPath("");
    }
  };

  const upscaylHandler = async () => {
    logit("🔄 Resetting Upscaled Image Path");
    setUpscaledImagePath("");
    setUpscaledBatchFolderPath("");
    if (imagePath !== "" || batchFolderPath !== "") {
      setProgress("Hold on...");
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
        });
        logit("🏁 UPSCAYL");
      }
    } else {
      alert(`Please select an image to upscale`);
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
      <img
        src="icon.png"
        alt="Upscayl icon"
        className="absolute left-1/2 top-1/2 w-36 -translate-x-1/2 -translate-y-1/2 animate-pulse"
      />
    );
  }

  return (
    <div className="flex h-screen w-screen flex-row overflow-hidden bg-base-300">
      <div className={`flex h-screen w-128 flex-col bg-base-100`}>
        {featureFlags.SHOW_UPSCAYL_CLOUD_INFO && (
          <UpscaylCloudModal
            show={showCloudModal}
            setShow={setShowCloudModal}
            setDontShowCloudModal={setDontShowCloudModal}
          />
        )}
        {window.electron.platform === "mac" && (
          <div className="mac-titlebar pt-8"></div>
        )}
        {/* HEADER */}
        <Header version={version} />
        {!dontShowCloudModal && featureFlags.SHOW_UPSCAYL_CLOUD_INFO && (
          <button
            className="rounded-btn mx-5 mb-5 animate-pulse bg-success p-1 text-sm text-slate-50 shadow-lg shadow-success/40"
            onClick={() => {
              setShowCloudModal(true);
            }}
          >
            Introducing Upscayl Cloud
          </button>
        )}

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
            outputHandler={outputHandler}
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
                src={"file:///" + imagePath}
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
              <span className="font-bold">Selected folder:</span>{" "}
              {batchFolderPath}
            </p>
          )}
        {/* BATCH UPSCALE DONE INFO */}
        {batchMode && upscaledBatchFolderPath.length > 0 && (
          <>
            <p className="select-none py-4 font-bold text-base-content">
              All done!
            </p>
            <button
              className="bg-gradient-blue btn btn-primary rounded-btn p-3 font-medium text-white/90 transition-colors"
              onClick={openFolderHandler}
            >
              Open Upscayled Folder
            </button>
          </>
        )}
        <ImageOptions
          zoomAmount={zoomAmount}
          setZoomAmount={setZoomAmount}
          resetImagePaths={resetImagePaths}
        />
        {!batchMode &&
          viewType === "lens" &&
          upscaledImagePath &&
          imagePath && (
            <div
              className="img-with-border group relative h-full w-full overflow-hidden"
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
                className={`invisible absolute left-0 top-0 h-full w-full bg-red-500 mix-blend-difference group-hover:visible group-hover:scale-[${
                  zoomAmount + "%"
                }]`}
                style={{
                  clipPath: `circle(${
                    lensSize / (parseInt(zoomAmount) / 100)
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
                    (lensSize - parseInt(zoomAmount) / 100) /
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
                      Original
                    </p>

                    <img
                      /* USE REGEX TO GET THE FILENAME AND ENCODE IT INTO PROPER FORM IN ORDER TO AVOID ERRORS DUE TO SPECIAL CHARACTERS */
                      src={"file:///" + imagePath}
                      alt="Original"
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
                      Upscayled
                    </p>
                    <img
                      /* USE REGEX TO GET THE FILENAME AND ENCODE IT INTO PROPER FORM IN ORDER TO AVOID ERRORS DUE TO SPECIAL CHARACTERS */
                      src={"file:///" + upscaledImagePath}
                      alt="Upscayl"
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
