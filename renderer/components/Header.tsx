import { featureFlags } from "@common/feature-flags";
import React from "react";
import Logo from "./icons/Logo";

export default function Header({ version }: { version: string }) {
  return (
    <a
      href="https://github.com/upscayl/upscayl"
      target="_blank"
      className={`outline-none focus-visible:ring-2`}
      data-tooltip-id="tooltip"
      data-tooltip-content="Star us on GitHub 😁"
    >
      <div className="flex items-center gap-3 px-5 py-5">
        <Logo className="inline-block h-14 w-14" />
        <div className="flex flex-col justify-center">
          <h1 className="text-3xl font-bold">
            Upscayl{" "}
            <span className="text-xs">
              {version} {featureFlags.APP_STORE_BUILD && "Mac"}
            </span>
          </h1>
          <p className="">AI Image Upscaler</p>
        </div>
      </div>
    </a>
  );
}
