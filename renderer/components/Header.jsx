import React from "react";

export default function Header() {
  return (
    <a href="https://github.com/upscayl/upscayl" target="_blank">
      <div className="flex items-center gap-3 px-5 py-5">
        <img
          src="/icon.png"
          className="inline-block w-14"
          alt="Upscayl Logo"
          data-tip="Star us on GitHub 😁"
        />
        <div className="flex flex-col justify-center">
          <h1 className="text-3xl font-bold text-neutral-50">Upscayl</h1>
          <p className="text-neutral-400">AI Image Upscaler</p>
        </div>
      </div>
    </a>
  );
}
