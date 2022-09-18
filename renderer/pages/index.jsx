import { useState, useEffect, useRef, useCallback } from "react";
import commands from "../../main/commands";
import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from "react-compare-slider";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ProgressBar from "../components/ProgressBar";
import ResetButton from "../components/ResetButton";
import LeftPaneSteps from "../components/LeftPaneSteps";
import RightPaneInfo from "../components/RightPaneInfo";

const Home = () => {
  const [imagePath, SetImagePath] = useState("");
  const [upscaledImagePath, setUpscaledImagePath] = useState("");
  const [outputPath, SetOutputPath] = useState("");
  const [scaleFactor, setScaleFactor] = useState(4);
  const [progress, setProgress] = useState("");
  const [model, setModel] = useState("realesrgan-x4plus");
  const [loaded, setLoaded] = useState(false);
  const [version, setVersion] = useState("");
  const [batchMode, setBatchMode] = useState(false);
  const [batchFolderPath, setBatchFolderPath] = useState("");
  const [doubleUpscayl, setDoubleUpscayl] = useState(false);

  const resetImagePaths = () => {
    setProgress("");
    SetImagePath("");
    setUpscaledImagePath("");
  };

  useEffect(() => {
    setLoaded(true);
    const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");

    setVersion(navigator.userAgent.match(/Upscayl\/([\d\.]+\d+)/)[1]);

    const handleErrors = (data) => {
      if (data.includes("invalid gpu")) {
        alert(
          "Error. Please make sure you have a Vulkan compatible GPU (Most modern GPUs support Vulkan). Upscayl does not work with CPU or iGPU sadly."
        );
        resetImagePaths();
      } else if (data.includes("failed")) {
        alert(
          data.includes("encode") ? "ENCODING ERROR => " : "DECODING ERROR => ",
          "This image is possibly corrupt or not supported by Upscayl. You could try converting the image into another format and upscaling again. Otherwise, make sure that the output path is correct and you have the proper write permissions for the directory. If not, then unfortuantely this image is not supported by Upscayl, sorry."
        );
        resetImagePaths();
      } else if (data.includes("uncaughtException")) {
        alert(
          "Upscayl encountered an error. Possibly, the upscayl binary failed to execute the commands properly. Try launching Upscayl using commandline through Terminal and see if you get any information. You can post an issue on Upscayl's GitHub repository for more help."
        );
        resetImagePaths();
      }
    };

    window.electron.on(commands.UPSCAYL_PROGRESS, (_, data) => {
      setSharpening(false);
      if (data.length > 0 && data.length < 10) {
        setProgress(data);
      }
      handleErrors(data);
    });

    window.electron.on(commands.DOUBLE_UPSCAYL_PROGRESS, (_, data) => {
      if (data.length > 0 && data.length < 10) {
        setProgress(data);
      }
      handleErrors(data);
    });

    window.electron.on(commands.UPSCAYL_DONE, (_, data) => {
      setProgress("");
      setUpscaledImagePath(data);
    });
    window.electron.on(commands.DOUBLE_UPSCAYL_DONE, (_, data) => {
      setUpscaledImagePath(data);
    });
  }, []);

  const selectImageHandler = async () => {
    resetImagePaths();
    var path = await window.electron.invoke(commands.SELECT_FILE);

    if (path !== "cancelled") {
      SetImagePath(path);
      var dirname = path.match(/(.*)[\/\\]/)[1] || "";
      SetOutputPath(dirname);
    }
  };

  const selectFolderHandler = async () => {
    var path = await window.electron.invoke(commands.SELECT_FOLDER);
    if (path !== "cancelled") {
      setBatchFolderPath(path);
      SetOutputPath(path + "_upscayled");
    }
  };

  const handleModelChange = (e) => {
    setModel(e.target.value);
  };

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

  const allowedFileTypes = ["png", "jpg", "jpeg", "webp"];

  const handleDrop = (e) => {
    e.preventDefault();
    resetImagePaths();

    const type = e.dataTransfer.items[0].type;
    console.log("🚀 => handleDrop => type", type);
    const filePath = e.dataTransfer.files[0].path;
    console.log("🚀 => handleDrop => filePath", filePath);
    const extension = e.dataTransfer.files[0].name.split(".").at(-1);
    console.log("🚀 => handleDrop => extension", extension);

    if (
      !type.includes("image") ||
      !allowedFileTypes.includes(extension.toLowerCase())
    ) {
      alert("Please drag and drop an image");
    } else {
      SetImagePath(filePath);
      var dirname = filePath.match(/(.*)[\/\\]/)[1] || "";
      console.log("🚀 => handleDrop => dirname", dirname);
      SetOutputPath(dirname);
    }
  };

  const handlePaste = (e) => {
    console.log(e);
    resetImagePaths();
    e.preventDefault();
    const type = e.clipboardData.items[0].type;
    const filePath = e.clipboardData.files[0].path;
    const extension = e.clipboardData.files[0].name.split(".").at(-1);

    if (
      !type.includes("image") &&
      !allowedFileTypes.includes(extension.toLowerCase())
    ) {
      alert("Please drag and drop an image");
    } else {
      SetImagePath(filePath);
      var dirname = filePath.match(/(.*)[\/\\]/)[1] || "";
      SetOutputPath(dirname);
    }
  };

  const outputHandler = async () => {
    var path = await window.electron.invoke(commands.SELECT_FOLDER);
    if (path !== "cancelled") {
      SetOutputPath(path);
    } else {
      console.log("Getting output path from input file");
    }
  };

  const upscaylHandler = async () => {
    setUpscaledImagePath("");
    if (imagePath !== "" || batchFolderPath !== "") {
      setProgress("Hold on...");
      if (model === "models-DF2K") {
        setDoubleUpscayl(false);
      }

      if (doubleUpscayl) {
        await window.electron.send(commands.DOUBLE_UPSCAYL, {
          imagePath,
          outputPath,
          model,
        });
      } else if (batchMode) {
        await window.electron.send(commands.FOLDER_UPSCAYL, {
          scaleFactor,
          batchFolderPath,
          outputPath,
          model,
        });
      } else {
        await window.electron.send(commands.UPSCAYL, {
          scaleFactor,
          imagePath,
          outputPath,
          model,
        });
      }
    } else {
      alert("Please select an image to upscale");
    }
  };

  return (
    <div className="flex h-screen w-screen flex-row overflow-hidden bg-[#1d1c23]">
      <div className="flex h-screen w-96 flex-col bg-[#26222c]">
        {imagePath.length > 0 && (
          <ResetButton resetImagePaths={resetImagePaths} />
        )}
        {/* HEADER */}
        <Header />

        {/* LEFT PANE */}
        <LeftPaneSteps
          progress={progress}
          selectImageHandler={selectImageHandler}
          selectFolderHandler={selectFolderHandler}
          handleModelChange={handleModelChange}
          handleDrop={handleDrop}
          outputHandler={outputHandler}
          upscaylHandler={upscaylHandler}
          batchMode={batchMode}
          setBatchMode={setBatchMode}
          imagePath={imagePath}
          outputPath={outputPath}
          doubleUpscayl={doubleUpscayl}
          setDoubleUpscayl={setDoubleUpscayl}
          model={model}
        />

        <Footer />
      </div>

      {/* RIGHT PANE */}
      <div
        className="relative flex h-screen w-full flex-col items-center justify-center"
        onDrop={(e) => handleDrop(e)}
        onDragOver={(e) => handleDragOver(e)}
        onDragEnter={(e) => handleDragEnter(e)}
        onDragLeave={(e) => handleDragLeave(e)}
        onPaste={(e) => handlePaste(e)}
      >
        {progress.length > 0 && upscaledImagePath.length === 0 && (
          <ProgressBar progress={progress} />
        )}

        {imagePath.length === 0 && batchFolderPath.length === 0 ? (
          <RightPaneInfo version={version} />
        ) : upscaledImagePath.length === 0 ? (
          <img
            className="h-full w-full object-contain"
            src={
              "file://" + `${upscaledImagePath ? upscaledImagePath : imagePath}`
            }
            draggable="false"
            alt=""
          />
        ) : !batchMode ? (
          <ReactCompareSlider
            itemOne={
              <ReactCompareSliderImage
                src={"file://" + imagePath}
                alt="Original"
                style={{
                  objectFit: "contain",
                }}
              />
            }
            itemTwo={
              <ReactCompareSliderImage
                src={"file://" + upscaledImagePath}
                alt="Upscayl"
                style={{
                  objectFit: "contain",
                }}
              />
            }
            className="h-screen"
          />
        ) : null}
      </div>
    </div>
  );
};

export default Home;
