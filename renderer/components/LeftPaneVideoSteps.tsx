import React from "react";
import Select from "react-select";
import ReactTooltip from "react-tooltip";

interface IProps {
  progress: string;
  selectVideoHandler: () => Promise<void>;
  handleModelChange: (e: any) => void;
  handleDrop: (e: any) => void;
  outputHandler: () => Promise<void>;
  upscaylHandler: () => Promise<void>;
  videoPath: string;
  outputPath: string;
  model: string;
  isVideo: boolean;
  setIsVideo: (arg: boolean) => void;
}

function LeftPaneVideoSteps({
  progress,
  selectVideoHandler,
  handleModelChange,
  handleDrop,
  outputHandler,
  upscaylHandler,
  videoPath,
  outputPath,
  model,
  isVideo,
  setIsVideo,
}: IProps) {
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
    { label: "2x Digital Art", value: "realesr-animevideov3-x2" },
    { label: "3x Digital Art", value: "realesr-animevideov3-x3" },
    { label: "4x Digital Art", value: "realesr-animevideov3-x4" },
  ];

  return (
    <div className="animate-step-in animate flex h-screen flex-col gap-7 overflow-y-auto p-5 overflow-x-hidden">
      {/* STEP 1 */}
      <div data-tip={videoPath}>
        <p className="step-heading">Step 1</p>
        <button className="btn-primary btn" onClick={selectVideoHandler}>
          Select Video
        </button>
      </div>

      {/* STEP 2 */}
      <div className="animate-step-in">
        <p className="step-heading">Step 2</p>
        <p className="mb-2 text-sm">Select Scaling</p>

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
      </div>

      {/* STEP 3 */}
      <div className="animate-step-in" data-tip={outputPath}>
        <p className="step-heading">Step 3</p>
        <p className="mb-2 text-sm">Defaults to Video's path</p>
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
      </div>

      <ReactTooltip class="max-w-sm" />
    </div>
  );
}

export default LeftPaneVideoSteps;
