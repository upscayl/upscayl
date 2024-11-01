import { FEATURE_FLAGS } from "@common/feature-flags";
import React from "react";
import UpscaylSVGLogo from "@/components/icons/upscayl-logo-svg";
import { useAtomValue } from "jotai";
import { translationAtom } from "@/atoms/translations-atom";

export default function Header({ version }: { version: string }) {
  const t = useAtomValue(translationAtom);

  return (
    <a
      href="https://github.com/upscayl/upscayl"
      target="_blank"
      className={`outline-none focus-visible:ring-2`}
      data-tooltip-id="tooltip"
      data-tooltip-content={t("HEADER.GITHUB_BUTTON_TITLE")}
    >
      <div className="flex items-center gap-3 px-5 py-5">
        <UpscaylSVGLogo className="inline-block h-14 w-14" />
        <div className="flex flex-col justify-center">
          <h1 className="text-3xl font-bold">
            {t("TITLE")}{" "}
            <span className="text-xs">
              {version} {FEATURE_FLAGS.APP_STORE_BUILD && "Mac"}
            </span>
          </h1>
          <p className="">{t("HEADER.DESCRIPTION")}</p>
        </div>
      </div>
    </a>
  );
}
