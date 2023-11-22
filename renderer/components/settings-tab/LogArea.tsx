import React from "react";

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
  return (
    <div className="relative flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <p className="text-sm font-medium">LOGS</p>
        <button className="btn-primary btn-xs btn" onClick={copyOnClickHandler}>
          {isCopied ? <span>Copied ✅</span> : <span>Copy Logs 📋</span>}
        </button>
      </div>
      <code className="rounded-btn rounded-r-none relative flex h-52 max-h-52 flex-col gap-3 overflow-y-auto break-all bg-base-200 p-4 text-xs">
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
