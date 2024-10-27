import { translationAtom } from "@/atoms/translations-atom";
import { useAtomValue } from "jotai";
import React, { useEffect } from "react";

type LogAreaProps = {
  copyOnClickHandler: () => void;
  isCopied: boolean;
  logData: string[];
};

export function LogArea({
  copyOnClickHandler,
  isCopied,
  logData,
}: LogAreaProps) {
  const ref = React.useRef<HTMLElement>(null);
  const t = useAtomValue(translationAtom);

  useEffect(() => {
    if (ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [logData]);

  return (
    <div className="relative flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <p className="text-sm font-medium">LOGS</p>
        <button className="btn btn-primary btn-xs" onClick={copyOnClickHandler}>
          {isCopied ? (
            <span>{t("SETTINGS.LOG_AREA.ON_COPY")}</span>
          ) : (
            <span>{t("SETTINGS.LOG_AREA.BUTTON_TITLE")}</span>
          )}
        </button>
      </div>
      <code
        className="relative flex h-52 max-h-52 flex-col gap-3 overflow-y-auto break-all rounded-btn rounded-r-none bg-base-200 p-4 text-xs"
        ref={ref}
      >
        {logData.length === 0 && (
          <p className="text-base-content/70">
            {t("SETTINGS.LOG_AREA.NO_LOGS")}
          </p>
        )}

        {logData.map((logLine: any) => {
          return <p className="">{logLine}</p>;
        })}
      </code>
    </div>
  );
}
