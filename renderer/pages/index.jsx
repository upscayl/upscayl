import { useState, useEffect, useRef, useCallback } from "react";
import commands from "../../main/commands";
import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from "react-compare-slider";

import Animated from "../public/loading.svg";
import Image from "next/image";

const Home = () => {
  const [imagePath, SetImagePath] = useState("");
  const [upscaledImagePath, setUpscaledImagePath] = useState("");
  const [outputPath, SetOutputPath] = useState("");
  const [scaleFactor, setScaleFactor] = useState(4);
  const [progress, setProgress] = useState("");
  const [model, setModel] = useState("realesrgan-x4plus");
  const [loaded, setLoaded] = useState(false);
  const [version, setVersion] = useState("");

  const resetImagePaths = () => {
    setProgress("");
    SetImagePath("");
    setUpscaledImagePath("");
  };

  useEffect(() => {
    setVersion(navigator.userAgent.match(/Upscayl\/([\d\.]+\d+)/)[1]);
  }, []);

  useEffect(() => {
    setLoaded(true);

    window.electron.on(commands.UPSCAYL_PROGRESS, (_, data) => {
      if (data.includes("invalid gpu")) {
        alert(
          "Error. Please make sure you have a Vulkan compatible GPU (Most modern GPUs support Vulkan). Upscayl does not work with CPU or iGPU sadly."
        );
        resetImagePaths();
      } else if (data.includes("failed")) {
        alert(
          "This image is possibly corrupt or not supported by Upscayl. You could try converting the image into another format and upscaling again. Otherwise, make sure that the output path is correct and you have the proper write permissions for the directory. If not, then unfortuantely this image is not supported by Upscayl, sorry."
        );
        resetImagePaths();
      } else if (data.length > 0 && data.length < 10) setProgress(data);
    });

    window.electron.on(commands.UPSCAYL_DONE, (_, data) => {
      setProgress("");
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
    const filePath = e.dataTransfer.files[0].path;
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
      SetOutputPath(dirname);
      window.electron.invoke(commands.SET_FILE, {original: filePath});
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
    if (imagePath !== "") {
      setProgress("Hold on...");
      await window.electron.send(commands.UPSCAYL, {
        scaleFactor,
        imagePath,
        outputPath,
        model,
      });
    } else {
      alert("Please select an image to upscale");
    }
  };

  return (
    <div className="flex h-screen w-screen flex-row overflow-hidden bg-neutral-900">
      <div className="flex h-screen w-96 flex-col bg-neutral-800">
        {imagePath.length > 0 && (
          <button
            className="absolute bottom-1 right-1 z-10 rounded-full bg-sky-400 py-2 px-4 opacity-50"
            onClick={resetImagePaths}
          >
            Reset
          </button>
        )}
        {/* HEADER */}
        <a href="https://github.com/upscayl/upscayl" target="_blank">
          <h1 className="pl-5 pt-5 text-3xl font-bold text-neutral-50">
            Upscayl
          </h1>
          <p className="mb-2 pl-5 text-neutral-400">AI Image Upscaler</p>
        </a>

        {/* LEFT PANE */}
        <div className="h-screen overflow-auto p-5">
          {/* STEP 1 */}
          <div className="mt-0">
            <p className="mb-2 font-medium text-neutral-100">Step 1</p>
            <button
              className="rounded-lg bg-rose-400 hover:bg-rose-300 transition-colors p-3 font-semibold"
              onClick={selectImageHandler}
            >
              Select Image
            </button>
          </div>
          {/* STEP 2 */}
          <div className="mt-5 animate-step-in">
            <p className="font-medium text-neutral-100">Step 2</p>
            <p className="mb-2 text-sm text-neutral-400">
              Select Upscaling Type
            </p>
            <select
              name="select-model"
              onDrop={(e) => handleDrop(e)}
              className="rounded-lg bg-slate-300 hover:bg-slate-200 p-3"
              onChange={handleModelChange}
            >
              <option value="realesrgan-x4plus">General Photo</option>
              <option value="realesrgan-x4plus-anime">Digital Art</option>
            </select>
          </div>

          {/* STEP 3
          <div className="mt-10">
            <p className="font-medium text-neutral-100">Step 3</p>
            <p className="mb-2 text-sm text-neutral-400">Select Scale Factor</p>
            <div className="animate flex flex-row gap-2">
              <button
                className={`h-12 w-12 rounded-lg ${
                  scaleFactor === 2 ? "bg-yellow-400" : "bg-neutral-400"
                }`}
                onClick={() => setScaleFactor(2)}
              >
                2x
              </button>
              <button
                className={`h-12 w-12 rounded-lg ${
                  scaleFactor === 3 ? "bg-yellow-400" : "bg-neutral-400"
                }`}
                onClick={() => setScaleFactor(3)}
              >
                3x
              </button>
              <button
                className={`h-12 w-12 rounded-lg ${
                  scaleFactor === 4 ? "bg-yellow-400" : "bg-neutral-400"
                }`}
                onClick={() => setScaleFactor(4)}
              >
                4x
              </button>
            </div>
          </div> */}

          {/* STEP 3 */}
          <div className="mt-5 animate-step-in">
            <p className="font-medium text-neutral-100">Step 3</p>
            <p className="mb-2 text-sm text-neutral-400">
              Defaults to Image's path
            </p>
            <button
              className="rounded-lg bg-teal-400 hover:bg-teal-300 transition-colors p-3 mt-1 font-semibold"
              onClick={outputHandler}
            >
              Set Output Folder
            </button>
          </div>

          {/* STEP 4 */}
          <div className="mt-5 animate-step-in">
            <p className="mb-2 font-medium text-neutral-100">Step 4</p>
            <button
              className="rounded-lg bg-sky-400 hover:bg-sky-300 transition-colors p-3 font-semibold"
              onClick={upscaylHandler}
              disabled={progress.length > 0}
            >
              {progress.length > 0 ? "Upscayling⏳" : "Upscayl"}
            </button>
          </div>
        </div>
        <div className="p-2 text-center text-sm text-neutral-500">
          <p>
            Copyright © 2022 -{" "}
            <a
              className="font-bold"
              href="https://github.com/upscayl/upscayl"
              target="_blank"
            >
              Upscayl
            </a>
          </p>
          <p>
            By{" "}
            <a
              href="https://github.com/TGS963"
              className="font-bold"
              target="_blank"
            >
              TGS963
            </a>{" "}
            and{" "}
            <a
              href="https://github.com/NayamAmarshe"
              className="font-bold"
              target="_blank"
            >
              Nayam Amarshe
            </a>
          </p>
        </div>
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
          <div className="absolute flex h-full w-full flex-col items-center justify-center bg-black/50 backdrop-blur-lg">
            <div className="flex flex-col items-center gap-2">
              <Image src={Animated} />
              <p className="font-bold text-neutral-50">{progress}</p>
            </div>
          </div>
        )}

        {imagePath.length === 0 ? (
          <>
            <p className="p-5 text-lg font-medium text-neutral-400">
              Select an Image to Upscale
            </p>
            <p className="text-neutral-600">Upscayl v{version}</p>
          </>
        ) : upscaledImagePath.length === 0 ? (
          <img
            className="h-full w-full object-contain"
            src={
              "file://" + `${upscaledImagePath ? upscaledImagePath : imagePath}`
            }
            draggable="false"
            alt=""
          />
        ) : (
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
        )}
      </div>
    </div>
  );
};

export default Home;
