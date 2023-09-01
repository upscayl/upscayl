"use client"
import { useState, useEffect, useCallback } from "react";
import commands from "../../electron/commands";
import { ReactCompareSlider } from "react-compare-slider";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ProgressBar from "../components/upscayl-tab/view/ProgressBar";
import RightPaneInfo from "../components/upscayl-tab/view/RightPaneInfo";
import ImageOptions from "../components/upscayl-tab/view/ImageOptions";
import LeftPaneImageSteps from "../components/upscayl-tab/config/LeftPaneImageSteps";
import Tabs from "../components/Tabs";
import SettingsTab from "../components/settings-tab";
import { useAtom } from "jotai";
import { logAtom } from "../atoms/logAtom";
import { modelsListAtom } from "../atoms/modelsListAtom";
import { batchModeAtom, scaleAtom } from "../atoms/userSettingsAtom";
import useLog from "../components/hooks/useLog";
import { UpscaylCloudModal } from "../components/UpscaylCloudModal";

const Home = () => {
  // STATES
  const [os, setOs] = useState<"linux" | "mac" | "win" | undefined>(undefined);
  const [imagePath, SetImagePath] = useState("");
  const [upscaledImagePath, setUpscaledImagePath] = useState("");
  const [outputPath, setOutputPath] = useState("");
  const [scaleFactor] = useState(4);
  const [progress, setProgress] = useState("");
  const [model, setModel] = useState("realesrgan-x4plus");
  const [loaded, setLoaded] = useState(false);
  const [version, setVersion] = useState("");
  const [batchMode, setBatchMode] = useAtom(batchModeAtom);
  const [batchFolderPath, setBatchFolderPath] = useState("");
  const [upscaledBatchFolderPath, setUpscaledBatchFolderPath] = useState("");
  const [doubleUpscayl, setDoubleUpscayl] = useState(false);
  const [overwrite, setOverwrite] = useState(false);
  const [doubleUpscaylCounter, setDoubleUpscaylCounter] = useState(0);
  const [quality, setQuality] = useState(0);
  const [gpuId, setGpuId] = useState("");
  const [saveImageAs, setSaveImageAs] = useState("png");
  const [zoomAmount, setZoomAmount] = useState("100%");
  const [backgroundPosition, setBackgroundPosition] = useState("0% 0%");
  const [dimensions, setDimensions] = useState({
    width: null,
    height: null,
  });
  const [selectedTab, setSelectedTab] = useState(0);
  const [logData, setLogData] = useAtom(logAtom);
  const [modelOptions, setModelOptions] = useAtom(modelsListAtom);
  const [scale] = useAtom(scaleAtom);

  const [showCloudModal, setShowCloudModal] = useState(false);

  const { logit } = useLog();

  // EFFECTS
  useEffect(() => {
    setLoaded(true);

    setVersion(navigator?.userAgent?.match(/Upscayl\/([\d\.]+\d+)/)[1]);

    const handleErrors = (data: string) => {
      if (data.includes("invalid gpu")) {
        alert(
          "Error. Please make sure you have a Vulkan compatible GPU (Most modern GPUs support Vulkan). Upscayl does not work with CPU or iGPU sadly."
        );
        resetImagePaths();
      } else if (data.includes("failed")) {
        if (batchMode) return;
        alert(
          data.includes("encode")
            ? "ENCODING ERROR => "
            : "DECODING ERROR => " +
                "This image is possibly corrupt or not supported by Upscayl, or your GPU drivers are acting funny (Did you check if your GPU is compatible and drivers are alright?). You could try converting the image into another format and upscaling again. Also make sure that the output path is correct and you have the proper write permissions for the directory. If not, then unfortuantely there's not much we can do to help, sorry."
        );
        resetImagePaths();
      } else if (data.includes("uncaughtException")) {
        alert(
          "Upscayl encountered an error. Possibly, the upscayl binary failed to execute the commands properly. Try checking the logs to see if you get any information. You can post an issue on Upscayl's GitHub repository for more help."
        );
        resetImagePaths();
      }
    };

    window.electron.on(
      commands.OS,
      (_, data: "linux" | "mac" | "win" | undefined) => {
        if (data) {
          setOs(data);
        }
      }
    );

    // LOG
    window.electron.on(commands.LOG, (_, data: string) => {
      logit(`🐞 BACKEND REPORTED: `, data);
    });

    // UPSCAYL PROGRESS
    window.electron.on(commands.UPSCAYL_PROGRESS, (_, data: string) => {
      if (data.length > 0 && data.length < 10) {
        setProgress(data);
      }
      handleErrors(data);
      logit(`🚧 UPSCAYL_PROGRESS: `, data);
    });

    // FOLDER UPSCAYL PROGRESS
    window.electron.on(commands.FOLDER_UPSCAYL_PROGRESS, (_, data: string) => {
      if (data.length > 0 && data.length < 10) {
        setProgress(data);
      }
      handleErrors(data);
      logit(`🚧 FOLDER_UPSCAYL_PROGRESS: `, data);
    });

    // DOUBLE UPSCAYL PROGRESS
    window.electron.on(commands.DOUBLE_UPSCAYL_PROGRESS, (_, data: string) => {
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
    window.electron.on(commands.UPSCAYL_DONE, (_, data: string) => {
      setProgress("");
      setUpscaledImagePath(data);
      logit("upscaledImagePath: ", data);
      logit(`💯 UPSCAYL_DONE: `, data);
    });

    // FOLDER UPSCAYL DONE
    window.electron.on(commands.FOLDER_UPSCAYL_DONE, (_, data: string) => {
      setProgress("");
      setUpscaledBatchFolderPath(data);
      logit(`💯 FOLDER_UPSCAYL_DONE: `, data);
    });

    // DOUBLE UPSCAYL DONE
    window.electron.on(commands.DOUBLE_UPSCAYL_DONE, (_, data: string) => {
      setProgress("");
      setDoubleUpscaylCounter(0);
      setUpscaledImagePath(data);
      logit(`💯 DOUBLE_UPSCAYL_DONE: `, data);
    });

    // CUSTOM FOLDER LISTENER
    window.electron.on(
      commands.CUSTOM_MODEL_FILES_LIST,
      (_, data: string[]) => {
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
            array.findIndex((t) => t.value === model.value) === index
        );
        setModelOptions(uniqueModelOptions);
      }
    );
    if (!localStorage.getItem("upscaylCloudModalShown")) {
      logit("⚙️ upscayl cloud show to true");
      localStorage.setItem("upscaylCloudModalShown", "true");
      setShowCloudModal(true);
    } 
  }, []);

  useEffect(() => {
    const customModelsPath = JSON.parse(
      localStorage.getItem("customModelsPath")
    );

    if (customModelsPath !== null) {
      window.electron.send(commands.GET_MODELS_LIST, customModelsPath);
      logit("🎯 GET_MODELS_LIST: ", customModelsPath);
    }
  }, []);

  useEffect(() => {
    const rememberOutputFolder = localStorage.getItem("rememberOutputFolder");
    const lastOutputFolderPath = localStorage.getItem("lastOutputFolderPath");

    if (rememberOutputFolder === "true") {
      setOutputPath(lastOutputFolderPath);
    } else {
      setOutputPath("");
      localStorage.removeItem("lastOutputFolderPath");
    }
  }, []);

  useEffect(() => {
    setProgress("");
    setOutputPath("");
  }, [batchMode]);

  useEffect(() => {
    if (imagePath.length > 0) {
      logit("🖼 imagePath: ", imagePath);

      const extension = imagePath.toLocaleLowerCase().split(".").pop();
      logit("🔤 Extension: ", extension);

      if (!allowedFileTypes.includes(extension.toLowerCase())) {
        alert("Please select an image");
        resetImagePaths();
      }
    } else {
      resetImagePaths();
    }
  }, [imagePath]);

  const resetImagePaths = () => {
    logit("🔄 Resetting image paths");

    setDimensions({
      width: null,
      height: null,
    });

    setProgress("");

    SetImagePath("");
    setUpscaledImagePath("");

    setBatchFolderPath("");
    setUpscaledBatchFolderPath("");
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

    var path = await window.electron.invoke(commands.SELECT_FILE);

    if (path !== null) {
      logit("🖼 Selected Image Path: ", path);
      SetImagePath(path);
      var dirname = path.match(/(.*)[\/\\]/)[1] || "";
      logit("📁 Selected Image Directory: ", dirname);
      setOutputPath(dirname);
    }
  };

  const selectFolderHandler = async () => {
    resetImagePaths();

    var path = await window.electron.invoke(commands.SELECT_FOLDER);

    if (path !== null) {
      logit("🖼 Selected Folder Path: ", path);
      setBatchFolderPath(path);
      setOutputPath(path + "_upscayled");
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
      JSON.stringify({ label: e.label, value: e.value })
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
    window.electron.send(commands.OPEN_FOLDER, upscaledBatchFolderPath);
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
      SetImagePath(filePath);

      var dirname = filePath.match(/(.*)[\/\\]/)[1] || "";
      logit("🗂 Setting output path: ", dirname);
      setOutputPath(dirname);
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
      SetImagePath(filePath);
      var dirname = filePath.match(/(.*)[\/\\]/)[1] || "";
      logit("🗂 Setting output path: ", dirname);
      setOutputPath(dirname);
    }
  };

  const outputHandler = async () => {
    var path = await window.electron.invoke(commands.SELECT_FOLDER);
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

    if (imagePath !== "" || batchFolderPath !== "") {
      setProgress("Hold on...");

      if (doubleUpscayl) {
        window.electron.send(commands.DOUBLE_UPSCAYL, {
          imagePath,
          outputPath,
          model,
          gpuId: gpuId.length === 0 ? null : gpuId,
          saveImageAs,
          scale,
        });
        logit("🏁 DOUBLE_UPSCAYL");
      } else if (batchMode) {
        setDoubleUpscayl(false);
        window.electron.send(commands.FOLDER_UPSCAYL, {
          scaleFactor,
          batchFolderPath,
          outputPath,
          model,
          gpuId: gpuId.length === 0 ? null : gpuId,
          saveImageAs,
          scale,
        });
        logit("🏁 FOLDER_UPSCAYL");
      } else {
        window.electron.send(commands.UPSCAYL, {
          scaleFactor,
          imagePath,
          outputPath,
          model,
          gpuId: gpuId.length === 0 ? null : gpuId,
          saveImageAs,
          scale,
          overwrite,
        });
        logit("🏁 UPSCAYL");
      }
    }
    // else if (isVideo && videoPath !== "") {
    // window.electron.send(commands.UPSCAYL_VIDEO, {
    //   scaleFactor,
    //   videoPath,
    //   outputPath,
    //   model,
    //   gpuId: gpuId.length === 0 ? null : gpuId,
    //   saveImageAs,
    // });
    // }
    else {
      alert(`Please select an image to upscale`);
      logit("🚫 No valid image selected");
    }
  };

  const stopHandler = () => {
    window.electron.send(commands.STOP);
    logit("🛑 Stopping Upscayl");
    resetImagePaths();
  };

  const allowedFileTypes = ["png", "jpg", "jpeg", "webp"];

  if (typeof window === "undefined") {
    return (
      <img
        src="icon.png"
        alt="Upscayl icon"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 animate-pulse"
      />
    );
  }

  return (
    <div className="flex h-screen w-screen flex-row overflow-hidden bg-base-300">
      <div className={`flex h-screen w-128 flex-col bg-base-100`}>
        <UpscaylCloudModal show={showCloudModal} setShow={setShowCloudModal} />
        {window.electron.platform === "mac" && (
          <div className="pt-8 mac-titlebar"></div>
        )}
        {/* HEADER */}
        <Header version={version} />
        <button
          className="mb-5 rounded-btn p-1 mx-5 bg-success shadow-lg shadow-success/40 text-slate-50 animate-pulse text-sm"
          onClick={() => {
            setShowCloudModal(true);
          }}>
          Introducing Upscayl Cloud
        </button>

        <Tabs selectedTab={selectedTab} setSelectedTab={setSelectedTab} />

        {selectedTab === 0 && (
          <LeftPaneImageSteps
            progress={progress}
            selectImageHandler={selectImageHandler}
            selectFolderHandler={selectFolderHandler}
            handleModelChange={handleModelChange}
            outputHandler={outputHandler}
            upscaylHandler={upscaylHandler}
            batchMode={batchMode}
            setBatchMode={setBatchMode}
            imagePath={imagePath}
            outputPath={outputPath}
            doubleUpscayl={doubleUpscayl}
            setDoubleUpscayl={setDoubleUpscayl}
            dimensions={dimensions}
            setGpuId={setGpuId}
            setModel={setModel}
            setSaveImageAs={setSaveImageAs}
          />
        )}

        {selectedTab === 1 && (
          <SettingsTab
            batchMode={batchMode}
            setModel={setModel}
            quality={quality}
            setQuality={setQuality}
            gpuId={gpuId}
            setGpuId={setGpuId}
            saveImageAs={saveImageAs}
            setSaveImageAs={setSaveImageAs}
            logData={logData}
            overwrite={overwrite}
            setOverwrite={setOverwrite}
            os={os}
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
        onPaste={(e) => handlePaste(e)}>
        {window.electron.platform === "mac" && (
          <div className="absolute top-0 w-full h-8 mac-titlebar"></div>
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
                src={
                  "file://" +
                  `${
                    upscaledImagePath
                      ? upscaledImagePath.replace(
                          /([^/\\]+)$/i,
                          encodeURIComponent(
                            upscaledImagePath.match(/[^/\\]+$/i)[0]
                          )
                        )
                      : imagePath.replace(
                          /([^/\\]+)$/i,
                          encodeURIComponent(imagePath.match(/[^/\\]+$/i)[0])
                        )
                  }`
                }
                onLoad={(e: any) => {
                  setDimensions({
                    width: e.target.naturalWidth,
                    height: e.target.naturalHeight,
                  });
                }}
                draggable="false"
                alt=""
                className="h-full w-full bg-[#1d1c23] object-contain"
              />
            </>
          )}

        {/* BATCH UPSCALE SHOW SELECTED FOLDER */}
        {batchMode &&
          upscaledBatchFolderPath.length === 0 &&
          batchFolderPath.length > 0 && (
            <p className="select-none font-bold text-neutral-50">
              Selected folder: {batchFolderPath}
            </p>
          )}

        {/* BATCH UPSCALE DONE INFO */}
        {batchMode && upscaledBatchFolderPath.length > 0 && (
          <>
            <p className="select-none py-4 font-bold text-neutral-50">
              All done!
            </p>
            <button
              className="btn btn-primary bg-gradient-blue rounded-btn p-3 font-medium text-white/90 transition-colors"
              onClick={openFolderHandler}>
              Open Upscayled Folder
            </button>
          </>
        )}

        {/* COMPARISON SLIDER */}
        {!batchMode && imagePath.length > 0 && upscaledImagePath.length > 0 && (
          <>
            <ImageOptions
              zoomAmount={zoomAmount}
              setZoomAmount={setZoomAmount}
              resetImagePaths={resetImagePaths}
            />
            <ReactCompareSlider
              itemOne={
                <>
                  <p className="absolute bottom-1 left-1 rounded-md bg-black p-1 text-sm font-medium text-white opacity-30">
                    Original
                  </p>

                  <img
                    /* USE REGEX TO GET THE FILENAME AND ENCODE IT INTO PROPER FORM IN ORDER TO AVOID ERRORS DUE TO SPECIAL CHARACTERS */
                    src={
                      "file:///" +
                      imagePath.replace(
                        /([^/\\]+)$/i,
                        encodeURIComponent(imagePath.match(/[^/\\]+$/i)[0])
                      )
                    }
                    alt="Original"
                    onMouseMove={handleMouseMove}
                    style={{
                      objectFit: "contain",
                      backgroundPosition: "0% 0%",
                      transformOrigin: backgroundPosition,
                    }}
                    className={`h-full w-full bg-[#1d1c23] transition-transform group-hover:scale-[${zoomAmount}]`}
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
                    src={
                      "file://" +
                      upscaledImagePath.replace(
                        /([^/\\]+)$/i,
                        encodeURIComponent(
                          upscaledImagePath.match(/[^/\\]+$/i)[0]
                        )
                      )
                    }
                    alt="Upscayl"
                    style={{
                      objectFit: "contain",
                      backgroundPosition: "0% 0%",
                      transformOrigin: backgroundPosition,
                    }}
                    onMouseMove={handleMouseMove}
                    className={`h-full w-full bg-[#1d1c23] transition-transform group-hover:scale-[${zoomAmount}]`}
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
