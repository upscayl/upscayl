import React, { useEffect, useState } from "react";
import Select from "react-select";
import ReactTooltip from "react-tooltip";
import { themeChange } from "theme-change";

interface IProps {
  progress: string;
  selectImageHandler: () => Promise<void>;
  selectFolderHandler: () => Promise<void>;
  handleModelChange: (e: any) => void;
  handleDrop: (e: any) => void;
  outputHandler: () => Promise<void>;
  upscaylHandler: () => Promise<void>;
  batchMode: boolean;
  setBatchMode: (arg: any) => void;
  imagePath: string;
  outputPath: string;
  doubleUpscayl: boolean;
  setDoubleUpscayl: (arg: boolean) => void;
  model: string;
  isVideo: boolean;
  setIsVideo: (arg: boolean) => void;
}

function LeftPaneImageSteps({
  progress,
  selectImageHandler,
  selectFolderHandler,
  handleModelChange,
  handleDrop,
  outputHandler,
  upscaylHandler,
  batchMode,
  setBatchMode,
  imagePath,
  outputPath,
  doubleUpscayl,
  setDoubleUpscayl,
  model,
  isVideo,
  setIsVideo,
}: IProps) {
  const [saveImageAs, setSaveImageAs] = useState("png");
  const [gpuId, setGpuId] = useState("0");

  useEffect(() => {
    themeChange(false);
    if (!localStorage.getItem("saveImageAs")) {
      localStorage.setItem("saveImageAs", "png");
    } else {
      setSaveImageAs(localStorage.getItem("saveImageAs"));
    }
  }, []);

  const setExportType = (format: string) => {
    setSaveImageAs(format);
    localStorage.setItem("saveImageAs", format);
  };

  const handleBatchMode = () => {
    setBatchMode((oldValue) => !oldValue);
  };

  const handleGpuIdChange = (e) => {
    setGpuId(e.target.value);
  };

  const customStyles = {
    option: (provided, state) => ({
      ...provided,
      borderBottom: "1px dotted pink",
      color: state.isSelected ? "red" : "blue",
      padding: 20,
    }),
    control: () => ({
      // none of react-select's styles are passed to <Control />
      width: 200,
    }),
    singleValue: (provided, state) => {
      const opacity = state.isDisabled ? 0.5 : 1;
      const transition = "opacity 300ms";

      return { ...provided, opacity, transition };
    },
  };

  const modelOptions = [
    { label: "General Photo (Remacri)", value: "remacri" },
    { label: "General Photo (Ultramix Balanced)", value: "ultramix_balanced" },
    { label: "General Photo (Real-ESRGAN)", value: "realesrgan-x4plus" },
    { label: "General Photo (Ultrasharp)", value: "ultrasharp" },
    { label: "Digital Art", value: "realesrgan-x4plus-anime" },
    { label: "Sharpen Image", value: "models-DF2K" },
  ];

  const availableThemes = [
    "light",
    "dark",
    "cupcake",
    "bumblebee",
    "emerald",
    "corporate",
    "synthwave",
    "retro",
    "cyberpunk",
    "valentine",
    "halloween",
    "garden",
    "forest",
    "aqua",
    "lofi",
    "pastel",
    "fantasy",
    "wireframe",
    "black",
    "luxury",
    "dracula",
    "cmyk",
    "autumn",
    "business",
    "acid",
    "lemonade",
    "night",
    "coffee",
    "winter",
  ];

  return (
    <div className="animate-step-in animate flex h-screen flex-col gap-7 overflow-y-auto p-5 overflow-x-hidden">
      {/* BATCH OPTION */}
      <div className="flex flex-row items-center gap-2">
        <input
          type="checkbox"
          className="toggle"
          onClick={handleBatchMode}></input>
        <p
          className="mr-1 inline-block  cursor-help text-sm"
          data-tip="This will let you upscale all files in a folder at once">
          Batch Upscale
        </p>
      </div>

      {/* STEP 1 */}
      <div data-tip={imagePath}>
        <p className="step-heading">Step 1</p>
        <button
          className="btn-primary btn"
          onClick={!batchMode ? selectImageHandler : selectFolderHandler}>
          Select {batchMode ? "Folder" : "Image"}
        </button>
      </div>

      {/* STEP 2 */}
      <div className="animate-step-in">
        <p className="step-heading">Step 2</p>
        <p className="mb-2 text-sm">Select Upscaling Type</p>

        <Select
          options={modelOptions}
          components={{
            IndicatorSeparator: () => null,
            DropdownIndicator: () => null,
          }}
          onChange={handleModelChange}
          className="react-select-container"
          classNamePrefix="react-select"
          defaultValue={modelOptions[0]}
        />

        {model !== "models-DF2K" && !batchMode && (
          <div className="mt-4 flex items-center gap-1">
            <input
              type="checkbox"
              className="checkbox"
              checked={doubleUpscayl}
              onChange={(e) => {
                if (e.target.checked) {
                  setDoubleUpscayl(true);
                } else {
                  setDoubleUpscayl(false);
                }
              }}
            />
            <p
              className="cursor-pointer text-sm"
              onClick={(e) => {
                setDoubleUpscayl(!doubleUpscayl);
              }}>
              Double Upscayl
            </p>
            <button
              className="badge-info badge cursor-help"
              data-tip="Enable this option to get an 8x upscayl. Note that this may not always work properly with all images, for example, images with really large resolutions.">
              i
            </button>
          </div>
        )}
      </div>

      {/* STEP 3 */}
      <div className="animate-step-in" data-tip={outputPath}>
        <p className="step-heading">Step 3</p>
        <p className="mb-2 text-sm">Defaults to Image's path</p>
        <button className="btn-primary btn" onClick={outputHandler}>
          Set Output Folder
        </button>
      </div>

      {/* STEP 4 */}
      <div className="animate-step-in">
        <p className="step-heading">Step 4</p>
        <button
          className="btn-accent btn"
          onClick={upscaylHandler}
          disabled={progress.length > 0}>
          {progress.length > 0 ? "Upscayling⏳" : "Upscayl"}
        </button>
        <div className="rounded-btn collapse mt-5">
          <input type="checkbox" className="peer" />
          <div className="collapse-title bg-neutral text-neutral-content peer-checked:bg-primary peer-checked:text-primary-content">
            Advanced Options
          </div>
          <div className="collapse-content flex flex-col gap-4 bg-neutral text-neutral-content peer-checked:bg-base-300 peer-checked:py-4 peer-checked:text-base-content">
            <div className="flex flex-col gap-2">
              <p>Save Image As:</p>
              <div className="flex gap-2">
                <button
                  className={`btn-primary btn ${
                    saveImageAs === "png" && "btn-accent"
                  }`}
                  onClick={() => setExportType("png")}>
                  PNG
                </button>
                <button
                  className={`btn-primary btn ${
                    saveImageAs === "jpg" && "btn-accent"
                  }`}
                  onClick={() => setExportType("jpg")}>
                  JPG
                </button>
                <button
                  className={`btn-primary btn ${
                    saveImageAs === "webp" && "btn-accent"
                  }`}
                  onClick={() => setExportType("webp")}>
                  WEBP
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <p>Upscayl Theme:</p>
              <select data-choose-theme className="select-primary select">
                <option value="dark">Default</option>
                {availableThemes.map((theme) => {
                  return (
                    <option value={theme} key={theme}>
                      {theme.toLocaleUpperCase()}
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <p>GPU ID:</p>
              <input
                type="number"
                placeholder="Type here"
                className="input w-full max-w-xs"
                value={gpuId}
                onChange={handleGpuIdChange}
              />
            </div>
          </div>
        </div>
      </div>

      <ReactTooltip class="max-w-sm" />
    </div>
  );
}

export default LeftPaneImageSteps;
