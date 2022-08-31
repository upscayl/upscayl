import React from "react";

function LeftPaneSteps(props) {
  return (
    <div className="h-screen overflow-auto p-5">
      {/* STEP 1 */}
      <div className="mt-0">
        <p className="mb-2 font-medium text-neutral-100">Step 1</p>
        <button
          className="rounded-lg bg-rose-400 p-3 transition-colors hover:bg-rose-300"
          onClick={props.selectImageHandler}
        >
          Select Image
        </button>
      </div>
      {/* STEP 2 */}
      <div className="animate-step-in mt-5">
        <p className="font-medium text-neutral-100">Step 2</p>
        <p className="mb-2 text-sm text-neutral-400">Select Upscaling Type</p>
        <select
          name="select-model"
          onDrop={(e) => props.handleDrop(e)}
          className="rounded-lg bg-slate-300 p-3 hover:bg-slate-200"
          onChange={props.handleModelChange}
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
      <div className="animate-step-in mt-5">
        <p className="font-medium text-neutral-100">Step 3</p>
        <p className="mb-2 text-sm text-neutral-400">
          Defaults to Image's path
        </p>
        <button
          className="mt-1 rounded-lg bg-teal-400 p-3 transition-colors hover:bg-teal-300"
          onClick={props.outputHandler}
        >
          Set Output Folder
        </button>
      </div>

      {/* STEP 4 */}
      <div className="animate-step-in mt-5">
        <p className="mb-2 font-medium text-neutral-100">Step 4</p>
        <button
          className="rounded-lg bg-sky-400 p-3 transition-colors hover:bg-sky-300"
          onClick={props.upscaylHandler}
          disabled={props.progress.length > 0}
        >
          {props.progress.length > 0 ? "Upscayling⏳" : "Upscayl"}
        </button>
      </div>
    </div>
  );
}

export default LeftPaneSteps;
