import React from "react";

function Footer() {
  return (
    <div className="p-2 text-center text-xs text-base-content/50">
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
