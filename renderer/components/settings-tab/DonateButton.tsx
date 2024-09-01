import { translationAtom } from "@/atoms/translations-atom";
import { useAtomValue } from "jotai";
import React from "react";

export function DonateButton() {
  const t = useAtomValue(translationAtom);

  return (
    <div className="flex flex-col gap-2 text-sm font-medium">
      <p>{t("APP.INFOS.DONATE.IF_LIKED")}</p>
      <a
        href="https://buymeacoffee.com/fossisthefuture"
        target="_blank"
        className="btn btn-primary"
      >
        {t("APP.INFOS.DONATE.DONATE")}
      </a>
    </div>
  );
}
