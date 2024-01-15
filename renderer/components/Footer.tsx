import { showNewsModalAtom } from "@/atoms/newsAtom";
import { useAtomValue, useSetAtom } from "jotai";
import React from "react";

function Footer() {
  const setShowNewsModal = useSetAtom(showNewsModalAtom);

  return (
    <div className="p-2 text-center text-xs text-base-content/50">
      <button
        className="badge badge-neutral mb-2"
        onClick={() => setShowNewsModal(true)}>
        UPSCAYL NEWS
      </button>
      <p>
        Copyright © {new Date().getFullYear()} -{" "}
        <a
          className="font-bold"
          href="https://github.com/upscayl/upscayl"
          target="_blank">
          Upscayl
        </a>
      </p>
      <p>
        By{" "}
        <a
          href="https://github.com/upscayl"
          className="font-bold"
          target="_blank">
          The Upscayl Team
        </a>
      </p>
    </div>
  );
}

export default Footer;
