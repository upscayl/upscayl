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
          {isCopied ? <span>COPIED ✅</span> : <span>COPY LOGS 📋</span>}
        </button>
      </div>
      <code
        className="rounded-btn relative flex h-52 max-h-52 flex-col gap-3 overflow-y-auto break-all rounded-r-none bg-base-200 p-4 text-xs"
        ref={ref}
      >
        {logData.length === 0 && (
          <p className="text-base-content/70">No logs to show</p>
        )}

        {logData.map((logLine: any) => {
          return <p className="">{logLine}</p>;
        })}
      </code>
    </div>
  );
}
