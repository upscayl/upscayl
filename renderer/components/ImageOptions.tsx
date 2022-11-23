import React from "react";

const ImageOptions = () => {
  return (
    <div className="animate rounded-btn collapse absolute top-0 z-50 m-2 w-96 opacity-25 hover:opacity-100">
      <input type="checkbox" className="peer" />
      <div className="collapse-title bg-base-100 text-center text-sm font-semibold uppercase text-primary-content peer-checked:bg-base-300 peer-checked:text-base-content">
        Show/Hide Image Settings
      </div>

      <div className="collapse-content bg-base-100 text-base-content">
        <div className="p-5">
          <button className="btn-primary btn">Start Again</button>
        </div>
      </div>
    </div>
  );
};

export default ImageOptions;
