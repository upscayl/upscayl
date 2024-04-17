import { useAtom, useAtomValue } from "jotai";
import React, { useCallback, useEffect, useState } from "react";
import { Tooltip } from "react-tooltip";
import { themeChange } from "theme-change";
import { modelsListAtom } from "../../../atoms/modelsListAtom";
import useLog from "../../hooks/useLog";
import {
  noImageProcessingAtom,
  savedOutputPathAtom,
  progressAtom,
  rememberOutputFolderAtom,
  scaleAtom,
} from "../../../atoms/userSettingsAtom";
import { featureFlags } from "@common/feature-flags";
import getModelScale from "@common/check-model-scale";
import COMMAND from "@common/commands";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronsUpDownIcon } from "lucide-react";

interface IProps {
  selectImageHandler: () => Promise<void>;
  selectFolderHandler: () => Promise<void>;
  handleModelChange: (e: any) => void;
  upscaylHandler: () => Promise<void>;
  batchMode: boolean;
  setBatchMode: React.Dispatch<React.SetStateAction<boolean>>;
  imagePath: string;
  doubleUpscayl: boolean;
  setDoubleUpscayl: React.Dispatch<React.SetStateAction<boolean>>;
  dimensions: {
    width: number | null;
    height: number | null;
  };
  setSaveImageAs: React.Dispatch<React.SetStateAction<string>>;
  model: string;
  setModel: React.Dispatch<React.SetStateAction<string>>;
  setGpuId: React.Dispatch<React.SetStateAction<string>>;
}

function LeftPaneImageSteps({
  selectImageHandler,
  selectFolderHandler,
  handleModelChange,
  upscaylHandler,
  batchMode,
  setBatchMode,
  imagePath,
  doubleUpscayl,
  setDoubleUpscayl,
  dimensions,
  setSaveImageAs,
  model,
  setModel,
  setGpuId,
}: IProps) {
  const [currentModel, setCurrentModel] = useState<{
    label: string;
    value: string;
  }>({
    label: null,
    value: null,
  });

  const modelOptions = useAtomValue(modelsListAtom);
  const scale = useAtomValue(scaleAtom);
  const noImageProcessing = useAtomValue(noImageProcessingAtom);
  const [outputPath, setOutputPath] = useAtom(savedOutputPathAtom);
  const [progress, setProgress] = useAtom(progressAtom);
  const rememberOutputFolder = useAtomValue(rememberOutputFolderAtom);
  const [open, setOpen] = React.useState(false);

  const [targetWidth, setTargetWidth] = useState<number>(null);
  const [targetHeight, setTargetHeight] = useState<number>(null);

  const { logit } = useLog();

  const outputHandler = async () => {
    var path = await window.electron.invoke(COMMAND.SELECT_FOLDER);
    if (path !== null) {
      logit("🗂 Setting Output Path: ", path);
      setOutputPath(path);
    } else {
      setOutputPath(null);
    }
  };

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
      const currentlySavedModel = JSON.parse(
        localStorage.getItem("model"),
      ) as (typeof modelOptions)[0];
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

  useEffect(() => {
    logit("🔀 Setting model to", currentModel.value);
  }, [currentModel]);

  useEffect(() => {
    setTargetWidth(getUpscaleResolution().width);
    setTargetHeight(getUpscaleResolution().height);
  }, [dimensions.width, dimensions.height, doubleUpscayl, scale]);

  const getUpscaleResolution = useCallback(() => {
    const newDimensions = {
      width: dimensions.width,
      height: dimensions.height,
    };

    let doubleScale = parseInt(scale) * parseInt(scale);
    let singleScale = parseInt(scale);

    if (noImageProcessing) {
      let initialScale = parseInt(getModelScale(model));
      doubleScale = initialScale * initialScale;
      singleScale = initialScale;
    }

    if (doubleUpscayl) {
      const newWidth = dimensions.width * doubleScale;
      const newHeight = dimensions.height * doubleScale;
      if (newWidth < 32768 || newHeight < 32768) {
        newDimensions.width = newWidth;
        newDimensions.height = newHeight;
      } else {
        newDimensions.width = 32384;
        newDimensions.height = 32384;
      }
    } else {
      newDimensions.width = dimensions.width * singleScale;
      newDimensions.height = dimensions.height * singleScale;
    }

    return newDimensions;
  }, [dimensions.width, dimensions.height, doubleUpscayl, scale]);

  return (
    <div
      className={`animate-step-in animate flex h-screen flex-col gap-7 overflow-y-auto overflow-x-hidden p-5`}
    >
      {/* BATCH OPTION */}
      <div className="flex flex-row items-center gap-2">
        <input
          type="checkbox"
          className="toggle"
          defaultChecked={batchMode}
          onClick={() => {
            if (!rememberOutputFolder) {
              setOutputPath("");
            }
            setProgress("");
            setBatchMode((oldValue) => !oldValue);
          }}
        ></input>
        <p
          className="mr-1 inline-block cursor-help text-sm"
          data-tooltip-id="tooltip"
          data-tooltip-content="This will let you Upscayl all files in a folder at once"
        >
          Batch Upscayl
        </p>
      </div>

      {/* STEP 1 */}
      <div data-tooltip-id="tooltip" data-tooltip-content={imagePath}>
        <p className="step-heading">Step 1</p>
        <button
          className="btn btn-primary"
          onClick={!batchMode ? selectImageHandler : selectFolderHandler}
        >
          Select {batchMode ? "Folder" : "Image"}
        </button>
      </div>

      {/* STEP 2 */}
      <div className="animate-step-in group">
        <p className="step-heading">Step 2</p>
        <p className="mb-2 text-sm">Select Model</p>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="default"
              role="combobox"
              aria-expanded={open}
              className="w-[200px] justify-between truncate transition-all group-hover:w-full group-active:w-full focus:w-full"
            >
              <p className="truncate">
                {currentModel.value
                  ? modelOptions.find(
                      (modelOption) => modelOption.value === currentModel.value,
                    )?.label
                  : "Select model..."}
              </p>
              <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent>
            <Command>
              <CommandInput placeholder="Search framework..." className="h-9" />
              <CommandEmpty>No framework found.</CommandEmpty>
              <CommandGroup>
                {modelOptions?.map(({ value, label }) => {
                  return (
                    <CommandItem
                      key={value.toString()}
                      value={value.toString()}
                    >
                      {label.toString()}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
        {/* 
        <Select
          options={modelOptions}
          components={{
            IndicatorSeparator: () => null,
            DropdownIndicator: () => null,
          }}
          onChange={(e) => {
            handleModelChange(e);
            setCurrentModel({ label: e.label, value: e.value });
          }}
          className="react-select-container transition-all group-hover:w-full group-active:w-full focus:w-full"
          classNamePrefix="react-select"
          value={currentModel}
        /> */}

        {!batchMode && (
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
              }}
            >
              Double Upscayl
            </p>
            <button
              className="badge badge-neutral badge-sm cursor-help"
              data-tooltip-id="tooltip"
              data-tooltip-content="Enable this option to get a 16x upscayl (we just run upscayl twice). Note that this may not always work properly with all images, for example, images with really large resolutions."
            >
              ?
            </button>
          </div>
        )}
      </div>

      {/* STEP 3 */}
      <div
        className="animate-step-in"
        data-tooltip-content={outputPath}
        data-tooltip-id="tooltip"
      >
        <div className="flex flex-col pb-2">
          <div className="step-heading flex items-center gap-2">
            <span className="leading-none">Step 3</span>
            {featureFlags.APP_STORE_BUILD && (
              <button
                className="badge badge-outline badge-sm cursor-pointer"
                onClick={() =>
                  alert(
                    "Due to MacOS App Store security restrictions, Upscayl requires you to select an output folder everytime you start it.\n\nTo avoid this, you can permanently save a default output folder in the Upscayl 'Settings' tab.",
                  )
                }
              >
                ?
              </button>
            )}
          </div>
          {!outputPath && featureFlags.APP_STORE_BUILD && (
            <div className="text-xs">
              <span className="rounded-btn bg-base-200 px-2 font-medium uppercase text-base-content/50">
                Not selected
              </span>
            </div>
          )}
        </div>
        {!batchMode && !featureFlags.APP_STORE_BUILD && (
          <p className="mb-2 text-sm">
            Defaults to {!batchMode ? "Image's" : "Folder's"} path
          </p>
        )}
        <button className="btn btn-primary" onClick={outputHandler}>
          Set Output Folder
        </button>
      </div>

      {/* STEP 4 */}
      <div className="animate-step-in">
        <p className="step-heading">Step 4</p>
        {dimensions.width && dimensions.height && (
          <p className="mb-2 text-sm">
            Upscayl from{" "}
            <span className="font-bold">
              {dimensions.width}x{dimensions.height}
            </span>{" "}
            to{" "}
            <span className="font-bold">
              {getUpscaleResolution().width}x{getUpscaleResolution().height}
            </span>
          </p>
        )}
        <button
          className="btn btn-accent"
          onClick={
            progress.length > 0 || !outputPath
              ? () => alert("Please select an output folder first")
              : upscaylHandler
          }
        >
          {progress.length > 0 ? "Upscayling⏳" : "Upscayl"}
        </button>
      </div>

      <Tooltip className="z-50 max-w-sm" id="tooltip" />
    </div>
  );
}

export default LeftPaneImageSteps;
