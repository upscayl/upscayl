import { useState, useEffect, useRef } from "react";
import commands from "../../main/commands";
import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from "react-compare-slider";

import Animated from '../public/loading.svg'
import Image from 'next/image'


const Home = () => {
  const [imagePath, SetImagePath] = useState("");
  const [upscaledImagePath, setUpscaledImagePath] = useState("");
  const [outputPath, SetOutputPath] = useState("");
  const [scaleFactor, setScaleFactor] = useState(4);
  const [progress, setProgress] = useState("");
  const [model, setModel] = useState("realesrgan-x4plus");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);

    window.electron.on(commands.UPSCAYL_PROGRESS, (_, data) => {
      if (data.length > 0 && data.length < 10) setProgress(data);
    });

    window.electron.on(commands.UPSCAYL_DONE, (_, data) => {
      setUpscaledImagePath(data);
    });
  }, []);

  const selectImageHandler = async () => {
    SetImagePath("");
    setUpscaledImagePath("");
    setProgress("");
    var path = await window.electron.invoke(commands.SELECT_FILE);

    if (path !== "cancelled") {
      SetImagePath(path);
      var dirname = path.match(/(.*)[\/\\]/)[1] || "";
      SetOutputPath(dirname);
    }
  };

  const handleCheck = (e) => {
    if (e.target.checked) {
      setModel("realesrgan-x4plus-anime")
    }
    else {
      setModel("realesrgan-x4plus")
    }
  }

  const outputHandler = async () => {
    var path = await window.electron.invoke(commands.SELECT_FOLDER);
    if (path !== "cancelled") {
      SetOutputPath(path);
    } else {
      console.log("Getting output path from input file");
    }
  };

  const upscaylHandler = async () => {
    setProgress("0.00%");
    await window.electron.send(commands.UPSCAYL, {
      scaleFactor,
      imagePath,
      outputPath,
      model,
    });
  };

  useEffect(() => {
    console.log(progress);
  }, [progress]);

  return (
    <div className="flex h-screen w-screen flex-row overflow-hidden bg-neutral-900">
      <div className="flex h-screen w-96 flex-col bg-neutral-800">
        {/* HEADER */}
        <h1 className="pl-5 pt-5 text-3xl font-bold text-neutral-50">
          Upscayl
        </h1>
        <p className="mb-2 pl-5 text-neutral-400">AI Image Upscaler</p>

        {/* LEFT PANE */}
        <div className="h-screen overflow-auto p-5">
          {/* STEP 1 */}
          <div className="mt-5">
            <p className="mb-2 font-medium text-neutral-100">Step 1</p>
            <button
              className="rounded-lg bg-rose-400 p-3"
              onClick={selectImageHandler}
            >
              Select Image
            </button>
          </div>
          <input className="appearance-none h-4 w-4 border border-gray-300 rounded-sm bg-white checked:bg-blue-600 checked:border-blue-600 focus:outline-none transition duration-200 mt-1 align-top bg-no-repeat bg-center bg-contain float-left mr-2 cursor-pointer" type="checkbox" onChange={handleCheck}/>
          <label className="text-neutral-100" >Anime</label>

          {/* STEP 2 */}
          <div className="mt-10">
            <p className="font-medium text-neutral-100">Step 2</p>
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
                onClick={() => setScaleFactor(6)}
              >
                4x
              </button>
            </div>
          </div>

          {/* STEP 3 */}
          <div className="mt-10">
            <p className="font-medium text-neutral-100">Step 3</p>
            <p className="mb-2 text-sm text-neutral-400">
              Defaults to Image's path
            </p>
            <button
              className="rounded-lg bg-teal-400 p-3"
              onClick={outputHandler}
            >
              Set Output Folder
            </button>
          </div>

          {/* STEP 4 */}
          <div className="mt-10">
            <p className="mb-2 font-medium text-neutral-100">Step 4</p>
            <button
              className="rounded-lg bg-sky-400 p-3"
              onClick={upscaylHandler}
            >
              Upscayl
            </button>
          </div>
        </div>

        <div className="p-2 text-center text-sm text-neutral-500">
          <p>
            Copyright © 2022 -{" "}
            <a
              className="font-bold"
              href="https://github.com/TGS963/upscayl"
              target="_blank"
            >
              Upscayl
            </a>
          </p>
          <p>
            Made by{" "}
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
      <div className="relative flex h-screen w-full flex-col items-center justify-center">
        {progress.length > 0 && (
          <div className="absolute flex h-full w-full flex-col items-center justify-center bg-black/50 backdrop-blur-lg">
            <div className="flex flex-col items-center gap-2">
              <Image src={Animated} />
              <p className="font-bold text-neutral-50">{progress}</p>
            </div>
          </div>
        )}

        {imagePath.length === 0 ? (
          <p className="p-5 text-lg font-medium text-neutral-400">
            Select an Image to Upscale
          </p>
        ) : upscaledImagePath.length === 0 ? (
          <img
            className="h-full w-full object-contain"
            src={
              "file://" + `${upscaledImagePath ? upscaledImagePath : imagePath}`
            }
            alt=""
          />
        ) : (
          <ReactCompareSlider
            itemOne={
              <ReactCompareSliderImage
                src={"file://" + imagePath}
                alt="Original"
              />
            }
            itemTwo={
              <ReactCompareSliderImage
                src={"file://" + upscaledImagePath}
                alt="Upscayl"
              />
            }
            className="h-full"
          />
        )}
      </div>
    </div>
  );
};

export default Home;
