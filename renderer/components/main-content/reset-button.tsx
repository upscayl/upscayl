import { translationAtom } from "@/atoms/translations-atom";
import { useAtomValue } from "jotai";
import React from "react";

function ResetButton(props) {
  const t = useAtomValue(translationAtom);

  return (
    <button
      className="animate bg-gradient-blue absolute right-1 top-1 z-10 rounded-full px-4 py-2 text-white opacity-30 hover:opacity-100"
      onClick={props.resetImagePaths}
    >
      {t("APP.RESET_BUTTON_TITLE")}
    </button>
  );
}

export default ResetButton;
