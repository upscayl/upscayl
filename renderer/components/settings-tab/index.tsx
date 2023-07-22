import { ThemeSelect } from "./ThemeSelect";
import { SaveOutputFolderToggle } from "./SaveOutputFolderToggle";
import { GpuIdInput } from "./GpuIdInput";
import { CustomModelsFolderSelect } from "./CustomModelsFolderSelect";
import { LogArea } from "./LogArea";
import { ImageScaleSelect } from "./ImageScaleSelect";
import { ImageFormatSelect } from "./ImageFormatSelect";
import { DonateButton } from "./DonateButton";
import React, { useEffect, useState } from "react";
import { themeChange } from "theme-change";
import { useAtom, useAtomValue } from "jotai";
import { customModelsPathAtom, scaleAtom } from "../../atoms/userSettingsAtom";
import { modelsListAtom } from "../../atoms/modelsListAtom";
import useLog from "../hooks/useLog";

interface IProps {
  batchMode: boolean;
  setModel: React.Dispatch<React.SetStateAction<string>>;
  saveImageAs: string;
  setSaveImageAs: React.Dispatch<React.SetStateAction<string>>;
  gpuId: string;
  setGpuId: React.Dispatch<React.SetStateAction<string>>;
  logData: string[];
}

function SettingsTab({
  batchMode,
  setModel,
  gpuId,
  setGpuId,
  saveImageAs,
  setSaveImageAs,
  logData,
}: IProps) {
  // STATES
  const [currentModel, setCurrentModel] = useState<{
    label: string;
    value: string;
  }>({
    label: null,
    value: null,
  });
  const [rememberOutputFolder, setRememberOutputFolder] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const [customModelsPath, setCustomModelsPath] = useAtom(customModelsPathAtom);
  const modelOptions = useAtomValue(modelsListAtom);
  const [scale, setScale] = useAtom(scaleAtom);

  const { logit } = useLog();

  useEffect(() => {
    themeChange(false);

    if (!localStorage.getItem("saveImageAs")) {
      logit("⚙️ Setting saveImageAs to png");
      localStorage.setItem("saveImageAs", "png");
    } else {
      const currentlySavedImageFormat = localStorage.getItem("saveImageAs");
      logit(
        "⚙️ Getting saveImageAs from localStorage",
        currentlySavedImageFormat
      );
      setSaveImageAs(currentlySavedImageFormat);
    }

    if (!localStorage.getItem("model")) {
      setCurrentModel(modelOptions[0]);
      setModel(modelOptions[0].value);
      localStorage.setItem("model", JSON.stringify(modelOptions[0]));
      logit("🔀 Setting model to", modelOptions[0].value);
    } else {
      const currentlySavedModel = JSON.parse(
        localStorage.getItem("model")
      ) as (typeof modelOptions)[0];
      setCurrentModel(currentlySavedModel);
      setModel(currentlySavedModel.value);
      logit(
        "⚙️ Getting model from localStorage",
        JSON.stringify(currentlySavedModel)
      );
    }

    if (!localStorage.getItem("gpuId")) {
      localStorage.setItem("gpuId", "");
      logit("⚙️ Setting gpuId to empty string");
    } else {
      const currentlySavedGpuId = localStorage.getItem("gpuId");
      setGpuId(currentlySavedGpuId);
      logit("⚙️ Getting gpuId from localStorage", currentlySavedGpuId);
    }

    if (!localStorage.getItem("rememberOutputFolder")) {
      logit("⚙️ Setting rememberOutputFolder to false");
      localStorage.setItem("rememberOutputFolder", "false");
    } else {
      const currentlySavedRememberOutputFolder = localStorage.getItem(
        "rememberOutputFolder"
      );
      logit(
        "⚙️ Getting rememberOutputFolder from localStorage",
        currentlySavedRememberOutputFolder
      );
      setRememberOutputFolder(
        currentlySavedRememberOutputFolder === "true" ? true : false
      );
    }
  }, []);

  // HANDLERS
  const setExportType = (format: string) => {
    setSaveImageAs(format);
    localStorage.setItem("saveImageAs", format);
  };

  const handleGpuIdChange = (e) => {
    setGpuId(e.target.value);
    localStorage.setItem("gpuId", e.target.value);
  };

  const copyOnClickHandler = () => {
    navigator.clipboard.writeText(logData.join("\n"));
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  return (
    <div className="animate-step-in animate flex h-screen flex-col gap-7 overflow-y-auto p-5 overflow-x-hidden">
      <a
        className="btn-primary btn"
        href="https://github.com/upscayl/upscayl/wiki/"
        target="_blank">
        Read WIKI
      </a>

      {/* THEME SELECTOR */}
      <ThemeSelect />

      <SaveOutputFolderToggle
        rememberOutputFolder={rememberOutputFolder}
        setRememberOutputFolder={setRememberOutputFolder}
      />

      {/* GPU ID INPUT */}
      <GpuIdInput gpuId={gpuId} handleGpuIdChange={handleGpuIdChange} />

      {/* CUSTOM MODEL */}
      <CustomModelsFolderSelect
        customModelsPath={customModelsPath}
        setCustomModelsPath={setCustomModelsPath}
      />

      {/* IMAGE FORMAT BUTTONS */}
      <ImageFormatSelect
        batchMode={batchMode}
        saveImageAs={saveImageAs}
        setExportType={setExportType}
      />

      {/* IMAGE SCALE */}
      <ImageScaleSelect scale={scale} setScale={setScale} />

      <LogArea
        copyOnClickHandler={copyOnClickHandler}
        isCopied={isCopied}
        logData={logData}
      />

      {/* DONATE BUTTON */}
      <DonateButton />
    </div>
  );
}

export default SettingsTab;
