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
import {
  customModelsPathAtom,
  noImageProcessingAtom,
  overwriteAtom,
  scaleAtom,
} from "../../atoms/userSettingsAtom";
import { modelsListAtom } from "../../atoms/modelsListAtom";
import useLog from "../hooks/useLog";
import { CompressionInput } from "./CompressionInput";
import OverwriteToggle from "./OverwriteToggle";
import { UpscaylCloudModal } from "../UpscaylCloudModal";
import { ResetSettings } from "./ResetSettings";
import { featureFlags } from "@common/feature-flags";
import TurnOffNotificationsToggle from "./TurnOffNotificationsToggle";
import { cn } from "@/lib/utils";
import { CustomResolutionInput } from "./CustomResolutionInput";

interface IProps {
  batchMode: boolean;
  setModel: React.Dispatch<React.SetStateAction<string>>;
  saveImageAs: string;
  setSaveImageAs: React.Dispatch<React.SetStateAction<string>>;
  compression: number;
  setCompression: React.Dispatch<React.SetStateAction<number>>;
  gpuId: string;
  setGpuId: React.Dispatch<React.SetStateAction<string>>;
  logData: string[];
  os: "linux" | "mac" | "win" | undefined;
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  setDontShowCloudModal: React.Dispatch<React.SetStateAction<boolean>>;
}

function SettingsTab({
  batchMode,
  setModel,
  compression,
  setCompression,
  gpuId,
  setGpuId,
  saveImageAs,
  setSaveImageAs,
  logData,
  os,
  show,
  setShow,
  setDontShowCloudModal,
}: IProps) {
  // STATES
  const [currentModel, setCurrentModel] = useState<{
    label: string;
    value: string;
  }>({
    label: null,
    value: null,
  });
  const [isCopied, setIsCopied] = useState(false);

  const [customModelsPath, setCustomModelsPath] = useAtom(customModelsPathAtom);
  const modelOptions = useAtomValue(modelsListAtom);
  const [scale, setScale] = useAtom(scaleAtom);
  const [enableScrollbar, setEnableScrollbar] = useState(true);
  const [timeoutId, setTimeoutId] = useState(null);

  const { logit } = useLog();

  useEffect(() => {
    themeChange(false);

    if (!localStorage.getItem("saveImageAs")) {
      logit("⚙️ Setting saveImageAs to png");
      localStorage.setItem("saveImageAs", "png");
    } else {
      const currentlySavedImageFormat = localStorage.getItem("saveImageAs");
      logit(
        "⚙️ Getting saveImageAs from localStorage: ",
        currentlySavedImageFormat,
      );
      setSaveImageAs(currentlySavedImageFormat);
    }

    if (!localStorage.getItem("model")) {
      setCurrentModel(modelOptions[0]);
      setModel(modelOptions[0].value);
      localStorage.setItem("model", JSON.stringify(modelOptions[0]));
      logit("🔀 Setting model to", modelOptions[0].value);
    } else {
      let currentlySavedModel = JSON.parse(
        localStorage.getItem("model"),
      ) as (typeof modelOptions)[0];
      if (
        modelOptions.find(
          (model) => model.value === currentlySavedModel.value,
        ) === undefined
      ) {
        localStorage.setItem("model", JSON.stringify(modelOptions[0]));
        logit("🔀 Setting model to", modelOptions[0].value);
        currentlySavedModel = modelOptions[0];
      }
      setCurrentModel(currentlySavedModel);
      setModel(currentlySavedModel.value);
      logit(
        "⚙️ Getting model from localStorage: ",
        JSON.stringify(currentlySavedModel),
      );
    }

    if (!localStorage.getItem("gpuId")) {
      localStorage.setItem("gpuId", "");
      logit("⚙️ Setting gpuId to empty string");
    } else {
      const currentlySavedGpuId = localStorage.getItem("gpuId");
      setGpuId(currentlySavedGpuId);
      logit("⚙️ Getting gpuId from localStorage: ", currentlySavedGpuId);
    }
  }, []);

  // HANDLERS
  const setExportType = (format: string) => {
    setSaveImageAs(format);
    localStorage.setItem("saveImageAs", format);
  };

  const handleCompressionChange = (e) => {
    setCompression(e.target.value);
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

  const upscaylVersion = navigator?.userAgent?.match(
    /Upscayl\/([\d\.]+\d+)/,
  )[1];

  function disableScrolling() {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    setTimeoutId(
      setTimeout(function () {
        setEnableScrollbar(false);
      }, 1000),
    );
  }

  function enableScrolling() {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    setEnableScrollbar(true);
  }

  return (
    <div
      className={cn(
        "animate-step-in animate z-50 flex h-screen flex-col gap-7 overflow-y-auto overflow-x-hidden p-5",
        enableScrollbar ? "" : "hide-scrollbar",
      )}
      onScroll={() => {
        if (enableScrollbar) disableScrolling();
      }}
      onWheel={() => {
        enableScrolling();
      }}
    >
      <div className="flex flex-col gap-2 text-sm font-medium uppercase">
        <p>Having issues?</p>
        <a
          className="btn btn-primary"
          href="https://github.com/upscayl/upscayl/wiki/"
          target="_blank"
        >
          GET HELP
        </a>
        {featureFlags.APP_STORE_BUILD && (
          <a
            className="btn btn-primary"
            href={`mailto:upscayl@gmail.com?subject=Upscayl%20Issue%3A%20%3CIssue%20name%20here%3E&body=Device%20Name%3A%20%3CYOUR%20DEVICE%20MODEL%3E%0AOperating%20System%3A%20%3CYOUR%20OPERATING%20SYSTEM%20VERSION%3E%0AUpscayl%20Version%3A%20${upscaylVersion}%0A%0AHi%2C%20I'm%20having%20an%20issue%20with%20Upscayl.%20%3CDESCRIBE%20ISSUE%20HERE%3E`}
            target="_blank"
          >
            EMAIL DEVELOPER
          </a>
        )}
        {!featureFlags.APP_STORE_BUILD && <DonateButton />}
      </div>

      <LogArea
        copyOnClickHandler={copyOnClickHandler}
        isCopied={isCopied}
        logData={logData}
      />

      {/* THEME SELECTOR */}
      <ThemeSelect />

      {/* IMAGE FORMAT BUTTONS */}
      <ImageFormatSelect
        batchMode={batchMode}
        saveImageAs={saveImageAs}
        setExportType={setExportType}
      />

      {/* IMAGE SCALE */}
      <ImageScaleSelect scale={scale} setScale={setScale} />

      <CustomResolutionInput />

      <CompressionInput
        compression={compression}
        handleCompressionChange={handleCompressionChange}
      />

      <SaveOutputFolderToggle />

      <OverwriteToggle />
      <TurnOffNotificationsToggle />

      {/* GPU ID INPUT */}
      <GpuIdInput gpuId={gpuId} handleGpuIdChange={handleGpuIdChange} />

      {/* CUSTOM MODEL */}
      <CustomModelsFolderSelect
        customModelsPath={customModelsPath}
        setCustomModelsPath={setCustomModelsPath}
      />

      {/* RESET SETTINGS */}
      <ResetSettings />

      {featureFlags.SHOW_UPSCAYL_CLOUD_INFO && (
        <>
          <button
            className="mx-5 mb-5 animate-pulse rounded-btn bg-success p-1 text-sm text-slate-50 shadow-lg shadow-success/40"
            onClick={() => {
              setShow(true);
            }}
          >
            Introducing Upscayl Cloud
          </button>

          <UpscaylCloudModal
            show={show}
            setShow={setShow}
            setDontShowCloudModal={setDontShowCloudModal}
          />
        </>
      )}
    </div>
  );
}

export default SettingsTab;
