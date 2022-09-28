import React from "react";
import Select from "react-select";
import ReactTooltip from "react-tooltip";

function LeftPaneSteps(props) {
  const handleBatchMode = () => {
    props.setBatchMode((oldValue) => !oldValue);
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
    { label: "General Photo", value: "realesrgan-x4plus" },
    { label: "Digital Art", value: "realesrgan-x4plus-anime" },
    { label: "Sharpen Image", value: "models-DF2K" },
  ];

  return (
    <div className="animate-step-in animate flex h-screen flex-col gap-7 overflow-auto p-5">
      {/* BATCH OPTION */}
      <div className="flex flex-row items-end">
        <p
          className="mr-1 inline-block cursor-help text-sm text-white/70"
          data-tip="This will let you upscale all files in a folder at once"
        >
          Batch Upscale:
        </p>
        <button
          className={`animate relative inline-block h-5 w-8 cursor-pointer rounded-full outline-none focus-visible:shadow-lg focus-visible:shadow-purple-500 ${
            props.batchMode ? "bg-gradient-purple" : "bg-neutral-500"
          }`}
          onClick={handleBatchMode}
        >
          <div
            className={`${
              props.batchMode ? "translate-x-4" : "translate-x-1"
            } animate absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-neutral-100`}
          ></div>
        </button>
      </div>

      {/* STEP 1 */}
      <div data-tip={props.imagePath}>
        <p className="step-heading">Step 1</p>
        <button
          className="animate bg-gradient-red rounded-lg p-3 font-medium text-white/90 outline-none transition-colors focus-visible:shadow-lg focus-visible:shadow-red-500"
          onClick={
            !props.batchMode
              ? props.selectImageHandler
              : props.selectFolderHandler
          }
        >
          Select {props.batchMode ? "Folder" : "Image"}
        </button>
      </div>

      {/* STEP 2 */}
      <div className="animate-step-in">
        <p className="step-heading">Step 2</p>
        <p className="mb-2 text-sm text-white/60">Select Upscaling Type</p>

        <Select
          options={modelOptions}
          components={{
            IndicatorSeparator: () => null,
            DropdownIndicator: () => null,
          }}
          onChange={props.handleModelChange}
          className="react-select-container"
          classNamePrefix="react-select"
          defaultValue={modelOptions[0]}
          theme={(theme) => ({
            ...theme,
            colors: {
              ...theme.colors,
              primary: "rgb(71 85 105)",
              primary25: "#f5f5f5",
              primary50: "#f5f5f5",
            },
          })}
          styles={{
            input: (provided, state) => ({
              ...provided,
              color: "rgb(100 100 100)",
            }),
            dropdownIndicator: (provided, state) => ({
              ...provided,
              color: "rgb(15 15 15)",
            }),
            placeholder: (provided, state) => ({
              ...provided,
              color: "rgb(15 15 15)",
              fontWeight: "500",
            }),
            singleValue: (provided, state) => ({
              ...provided,
              color: "rgb(15 15 15)",
              fontWeight: "500",
            }),
            menu: (provided, state) => ({
              ...provided,
              background: "#f5f5f5",
            }),
          }}
        />

        {/* <select
          name="select-model"
          onDrop={(e) => props.handleDrop(e)}
          className="animate bg-gradient-white block cursor-pointer rounded-lg p-3 font-medium text-black/90 outline-none hover:bg-slate-200 focus-visible:ring-2 focus-visible:ring-slate-400"
          onChange={props.handleModelChange}
        >
          <option value="realesrgan-x4plus">General Photo</option>
          <option value="realesrgan-x4plus-anime">Digital Art</option>
          <option value="models-DF2K">Sharpen Image</option>
        </select> */}

        {props.model !== "models-DF2K" && !props.batchMode && (
          <div className="mt-2 flex items-center gap-1">
            <input
              type="checkbox"
              className="checked:bg-gradient-white h-4 w-4 cursor-pointer appearance-none rounded-full bg-white/30 transition duration-200 focus:outline-none focus-visible:border focus-visible:shadow-lg focus-visible:shadow-white/40"
              checked={props.doubleUpscayl}
              onChange={(e) => {
                if (e.target.checked) {
                  props.setDoubleUpscayl(true);
                } else {
                  props.setDoubleUpscayl(false);
                }
              }}
            />
            <p
              className={`inline-block cursor-pointer select-none rounded-full text-sm font-medium ${
                props.doubleUpscayl
                  ? "bg-gradient-white px-2 text-black/90"
                  : "text-white/50"
              }`}
              onClick={(e) => {
                props.setDoubleUpscayl(!props.doubleUpscayl);
              }}
            >
              Double Upscayl
            </p>
            <span
              className="cursor-help rounded-full bg-white/20 px-3 text-center font-bold text-white/40"
              data-tip="Enable this option to get an 8x upscayl. Note that this may not always work properly with all images, for example, images with really large resolutions."
            >
              i
            </span>
          </div>
        )}
      </div>

      {/* STEP 3 */}
      <div className="animate-step-in" data-tip={props.outputPath}>
        <p className="step-heading">Step 3</p>
        <p className="mb-2 text-sm text-white/60">Defaults to Image's path</p>
        <button
          className="animate bg-gradient mt-1 rounded-lg p-3 font-medium text-black/90 outline-none transition-colors focus-visible:shadow-lg focus-visible:shadow-green-500"
          onClick={props.outputHandler}
        >
          Set Output Folder
        </button>
      </div>

      {/* STEP 4 */}
      <div className="animate-step-in">
        <p className="step-heading">Step 4</p>
        <button
          className="animate bg-gradient-upscayl rounded-lg p-3 font-medium text-white/90 outline-none transition-colors focus-visible:shadow-lg focus-visible:shadow-violet-500"
          onClick={props.upscaylHandler}
          disabled={props.progress.length > 0}
        >
          {props.progress.length > 0 ? "Upscayling⏳" : "Upscayl"}
        </button>
      </div>

      <ReactTooltip
        className="max-w-md break-words bg-neutral-900 text-neutral-50"
        place="top"
      />
    </div>
  );
}

export default LeftPaneSteps;
