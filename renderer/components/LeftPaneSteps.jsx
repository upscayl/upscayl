import React from "react";
import ReactTooltip from "react-tooltip";

function LeftPaneSteps(props) {
  const handleBatchMode = () => {
    props.setBatchMode((oldValue) => !oldValue);
  };

  return (
    <div className="animate-step-in animate flex h-screen flex-col gap-7 overflow-auto p-5">
      {/* BATCH OPTION */}
      <div className="flex flex-row items-end">
        <p
          className="mr-1 inline-block cursor-help text-sm text-neutral-400"
          data-tip="This will let you upscale all files in a folder at once"
        >
          Batch Upscale:
        </p>
        <div
          className={`animate relative inline-block h-5 w-8 cursor-pointer rounded-full ${
            props.batchMode ? "bg-gradient-purple" : "bg-neutral-500"
          }`}
          onClick={handleBatchMode}
        >
          <div
            className={`${
              props.batchMode ? "right-1" : "left-1"
            } animate absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-neutral-100`}
          ></div>
        </div>
      </div>

      {!props.batchMode ? (
        <>
          {/* STEP 1 */}
          <div data-tip={props.imagePath}>
            <p className="mb-2 font-medium text-white/70">Step 1</p>
            <button
              className="bg-gradient-red rounded-lg p-3 font-medium text-white/90 transition-colors"
              onClick={props.selectImageHandler}
            >
              Select Image
            </button>
          </div>

          {/* STEP 2 */}
          <div className="animate-step-in">
            <p className="font-medium text-neutral-100">Step 2</p>
            <p className="mb-2 text-sm text-neutral-400">
              Select Upscaling Type
            </p>
            {props.model !== "models-DF2K" && (
              <div className="mb-2 flex items-center gap-1">
                <input
                  type="checkbox"
                  className="checked:bg-gradient-white h-4 w-4 cursor-pointer appearance-none rounded-full bg-neutral-500 transition duration-200 focus:outline-none focus-visible:border focus-visible:border-green-400"
                  onChange={(e) => {
                    props.setDoubleUpscayl(e.target.checked);
                  }}
                />
                <p
                  className={`inline-block cursor-help rounded-full text-sm font-medium ${
                    props.doubleUpscayl
                      ? "text-neutral-100"
                      : "text-neutral-500"
                  }`}
                >
                  Double Upscayl
                </p>
              </div>
            )}
            <select
              name="select-model"
              onDrop={(e) => props.handleDrop(e)}
              className="animate bg-gradient-white block cursor-pointer rounded-lg p-3 font-medium text-black/90 hover:bg-slate-200"
              onChange={props.handleModelChange}
            >
              <option value="realesrgan-x4plus">General Photo</option>
              <option value="realesrgan-x4plus-anime">Digital Art</option>
              <option value="models-DF2K">Sharpen Image</option>
            </select>
          </div>

          {/* STEP 3 */}
          <div className="animate-step-in" data-tip={props.outputPath}>
            <p className="font-medium text-neutral-100">Step 3</p>
            <p className="mb-2 text-sm text-neutral-400">
              Defaults to Image's path
            </p>
            <button
              className="bg-gradient mt-1 rounded-lg p-3 font-medium text-white/90 transition-colors hover:bg-teal-300"
              onClick={props.outputHandler}
            >
              Set Output Folder
            </button>
          </div>

          {/* STEP 4 */}
          <div className="animate-step-in">
            <p className="mb-2 font-medium text-neutral-100">Step 4</p>
            <button
              className="bg-gradient-upscayl rounded-lg p-3 font-medium text-white/90 transition-colors"
              onClick={props.upscaylHandler}
              disabled={props.progress.length > 0}
            >
              {props.progress.length > 0 ? "Upscayling⏳" : "Upscayl"}
            </button>
          </div>
        </>
      ) : (
        <>
          {/* STEP 1 */}
          <div className="">
            <p className="mb-2 font-medium text-neutral-100">Step 1</p>
            <button
              className="rounded-lg bg-rose-400 p-3 transition-colors hover:bg-rose-300"
              onClick={props.selectFolderHandler}
            >
              Select Folder
            </button>
          </div>

          {/* STEP 2 */}
          <div className="animate-step-in">
            <p className="font-medium text-neutral-100">Step 2</p>
            <p className="mb-2 text-sm text-neutral-400">
              Select Upscaling Type
            </p>
            <select
              name="select-model"
              onDrop={(e) => props.handleDrop(e)}
              className="rounded-lg bg-slate-300 p-3 hover:bg-slate-200"
              onChange={props.handleModelChange}
            >
              <option value="realesrgan-x4plus">General Photo</option>
              <option value="realesrgan-x4plus-anime">Digital Art</option>
              <option value="models-DF2K">Sharpen Image</option>
            </select>
          </div>

          {/* STEP 3 */}
          <div className="animate-step-in">
            <p className="font-medium text-neutral-100">Step 3</p>
            <p className="mb-2 text-sm text-neutral-400">
              Defaults to Folder's path
            </p>
            <button
              className="mt-1 rounded-lg bg-teal-400 p-3 transition-colors hover:bg-teal-300"
              onClick={props.outputHandler}
            >
              Set Output Folder
            </button>
          </div>

          {/* STEP 4 */}
          <div className="animate-step-in">
            <p className="mb-2 font-medium text-neutral-100">Step 4</p>
            <button
              className="rounded-lg bg-sky-400 p-3 transition-colors hover:bg-sky-300"
              onClick={props.upscaylHandler}
              disabled={props.progress.length > 0}
            >
              {props.progress.length > 0 ? "Upscayling⏳" : "Upscayl"}
            </button>
          </div>
        </>
      )}
      <ReactTooltip
        className="max-w-72 break-words bg-neutral-900 text-neutral-50"
        place="top"
      />
    </div>
  );
}

export default LeftPaneSteps;
