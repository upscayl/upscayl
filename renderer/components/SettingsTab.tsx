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
  setBatchMode: React.Dispatch<React.SetStateAction<boolean>>;
  imagePath: string;
  outputPath: string;
  doubleUpscayl: boolean;
  setDoubleUpscayl: React.Dispatch<React.SetStateAction<boolean>>;
  model: string;
  setModel: React.Dispatch<React.SetStateAction<string>>;
  isVideo: boolean;
  setIsVideo: React.Dispatch<React.SetStateAction<boolean>>;
  saveImageAs: string;
  setSaveImageAs: React.Dispatch<React.SetStateAction<string>>;
  gpuId: string;
  setGpuId: React.Dispatch<React.SetStateAction<string>>;
  dimensions: {
    width: number | null;
    height: number | null;
  };
}

function SettingsTab({
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
  setModel,
  isVideo,
  setIsVideo,
  gpuId,
  setGpuId,
  saveImageAs,
  setSaveImageAs,
  dimensions,
}: IProps) {
  const [currentModel, setCurrentModel] = useState<{
    label: string;
    value: string;
  }>({
    label: null,
    value: null,
  });

  useEffect(() => {
    themeChange(false);

    if (!localStorage.getItem("saveImageAs")) {
      localStorage.setItem("saveImageAs", "png");
    } else {
      const currentlySavedImageFormat = localStorage.getItem("saveImageAs");
      setSaveImageAs(currentlySavedImageFormat);
    }

    if (!localStorage.getItem("model")) {
      setCurrentModel(modelOptions[0]);
      setModel(modelOptions[0].value);
      localStorage.setItem("model", JSON.stringify(modelOptions[0]));
    } else {
      const currentlySavedModel = JSON.parse(
        localStorage.getItem("model")
      ) as typeof modelOptions[0];
      setCurrentModel(currentlySavedModel);
      setModel(currentlySavedModel.value);
    }

    if (!localStorage.getItem("gpuId")) {
      localStorage.setItem("gpuId", "");
    } else {
      const currentlySavedGpuId = localStorage.getItem("gpuId");
      setGpuId(currentlySavedGpuId);
    }
  }, []);

  useEffect(() => {
    console.log("Current Model: ", currentModel);
  }, [currentModel]);

  const setExportType = (format: string) => {
    setSaveImageAs(format);
    localStorage.setItem("saveImageAs", format);
  };

  const handleBatchMode = () => {
    setBatchMode((oldValue) => !oldValue);
  };

  const handleGpuIdChange = (e) => {
    setGpuId(e.target.value);
    localStorage.setItem("gpuId", e.target.value);
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
    { label: "General Photo (Real-ESRGAN)", value: "realesrgan-x4plus" },
    { label: "General Photo (Remacri)", value: "remacri" },
    { label: "General Photo (Ultramix Balanced)", value: "ultramix_balanced" },
    { label: "General Photo (Ultrasharp)", value: "ultrasharp" },
    { label: "Digital Art", value: "realesrgan-x4plus-anime" },
  ];

  const availableThemes = [
    { label: "light", value: "light" },
    { label: "dark", value: "dark" },
    { label: "cupcake", value: "cupcake" },
    { label: "bumblebee", value: "bumblebee" },
    { label: "emerald", value: "emerald" },
    { label: "corporate", value: "corporate" },
    { label: "synthwave", value: "synthwave" },
    { label: "retro", value: "retro" },
    { label: "cyberpunk", value: "cyberpunk" },
    { label: "valentine", value: "valentine" },
    { label: "halloween", value: "halloween" },
    { label: "garden", value: "garden" },
    { label: "forest", value: "forest" },
    { label: "aqua", value: "aqua" },
    { label: "lofi", value: "lofi" },
    { label: "pastel", value: "pastel" },
    { label: "fantasy", value: "fantasy" },
    { label: "wireframe", value: "wireframe" },
    { label: "black", value: "black" },
    { label: "luxury", value: "luxury" },
    { label: "dracula", value: "dracula" },
    { label: "cmyk", value: "cmyk" },
    { label: "autumn", value: "autumn" },
    { label: "business", value: "business" },
    { label: "acid", value: "acid" },
    { label: "lemonade", value: "lemonade" },
    { label: "night", value: "night" },
    { label: "coffee", value: "coffee" },
    { label: "winter", value: "winter" },
  ];

  useEffect(() => {}, [imagePath]);

  return (
    <div className="animate-step-in animate flex h-screen flex-col gap-7 overflow-y-auto p-5 overflow-x-hidden">
      {/* IMAGE FORMAT BUTTONS */}
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">Save Image As:</p>
        <div className="flex flex-col gap-2">
          {batchMode && (
            <p className="text-xs text-base-content/70">
              Only PNG is supported in Batch Upscale
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {/* PNG */}
            <button
              className={`btn-primary btn ${
                saveImageAs === "png" && "btn-accent"
              }`}
              onClick={() => setExportType("png")}>
              PNG
            </button>
            {/* JPG */}
            <button
              className={`btn-primary btn ${
                saveImageAs === "jpg" && "btn-accent"
              }`}
              onClick={() => setExportType("jpg")}>
              JPG
            </button>
            {/* WEBP */}
            <button
              className={`btn-primary btn ${
                saveImageAs === "webp" && "btn-accent"
              }`}
              onClick={() => setExportType("webp")}>
              WEBP
            </button>
          </div>
        </div>
      </div>

      {/* THEME SELECTOR */}
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">Upscayl Theme:</p>
        <select data-choose-theme className="select-primary select">
          <option value="dark">Default</option>
          {availableThemes.map((theme) => {
            return (
              <option value={theme.value} key={theme.value}>
                {theme.label.toLocaleUpperCase()}
              </option>
            );
          })}
        </select>
      </div>

      {/* GPU ID INPUT */}
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium">GPU ID:</p>
        <input
          type="text"
          placeholder="Type here"
          className="input-bordered input w-full max-w-xs"
          value={gpuId}
          onChange={handleGpuIdChange}
        />
      </div>

      <div className="relative flex flex-col gap-2">
        <button
          className="btn-primary btn-xs btn absolute top-10 right-5 z-10"
          onClick={() => {
            navigator.clipboard.writeText("Hello World!");
          }}>
          Copy 📋
        </button>
        <p className="text-sm font-medium">Logs</p>
        <code className="rounded-btn min-h-16 relative h-full max-h-64 overflow-y-auto bg-base-200 p-4">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Corrupti,
          odit autem eos eius explicabo optio minima ducimus est id similique
          distinctio, sit natus! Harum, tempora saepe ipsam ipsa at, tenetur
          tempore dolorem dolore officiis, soluta voluptate! Officia
          repellendus, eligendi sunt voluptates inventore maxime expedita autem
          fuga dignissimos atque aliquid amet, sequi in cupiditate? Nulla
          reprehenderit labore quas quis natus dolor quos qui repellendus rerum
          ducimus, unde, porro placeat deserunt maiores ex aliquam. Assumenda
          laborum atque iure, nulla unde repudiandae cum odit libero magni vero
          veritatis voluptates quaerat tempore quod ex sint iusto. Illum,
          repudiandae id consequatur facere molestiae itaque asperiores.
        </code>
      </div>

      {/* DONATE BUTTON */}
      <div className="mt-auto flex flex-col items-center justify-center gap-2 text-sm font-medium">
        <p>If you like what we do :)</p>
        <a href="https://buymeacoffee.com/fossisthefuture" target="_blank">
          <button className="btn-primary btn">Donate</button>
        </a>
      </div>
    </div>
  );
}

export default SettingsTab;
