import React from "react";

function ResetButton(props) {
  return (
    <button
      className="animate absolute bottom-1 right-1 z-10 rounded-full bg-sky-400 py-2 px-4 opacity-50 hover:opacity-100"
      onClick={props.resetImagePaths}
    >
      Reset
    </button>
  );
}

export default ResetButton;
