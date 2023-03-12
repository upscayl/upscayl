import React from "react";

export default function Header({ version }: { version: string }) {
  return (
    <a
      href="https://github.com/upscayl/upscayl"
      target="_blank"
      className="outline-none focus-visible:ring-2"
      data-tip="Star us on GitHub 😁">
      <div className="flex items-center gap-3 px-5 py-5">
        <img src="icon.png" className="inline-block w-14" alt="Upscayl Logo" />
        <div className="flex flex-col justify-center">
          <h1 className="text-3xl font-bold">
            Upscayl <span className="text-xs">{version}</span>
          </h1>
          <p className="">AI Image Upscaler</p>
        </div>
      </div>
    </a>
  );
}
