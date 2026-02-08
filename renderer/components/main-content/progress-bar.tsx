import React, { useEffect, useMemo } from "react";
import UpscaylSVGLogo from "@/components/icons/upscayl-logo-svg";
import { useAtomValue } from "jotai";
import { translationAtom } from "@/atoms/translations-atom";
import type { BatchProgressDetails } from "@/atoms/user-settings-atom";
import { ELECTRON_COMMANDS } from "@common/electron-commands";
import useLogger from "../hooks/use-logger";

function formatTimeRemaining(ms: number): string {
  if (ms <= 0 || !Number.isFinite(ms)) return "—";
  const seconds = Math.floor((ms / 1000) % 60);
  const minutes = Math.floor((ms / (1000 * 60)) % 60);
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours} h`);
  if (minutes > 0) parts.push(`${minutes} min`);
  if (seconds > 0 || parts.length === 0) parts.push(`${seconds} s`);
  return parts.join(" ");
}

function formatStorageSize(bytes: number): string {
  if (bytes <= 0 || !Number.isFinite(bytes)) return "—";
  const mb = bytes / (1024 * 1024);
  if (mb >= 1024) {
    const gb = (bytes / (1024 * 1024 * 1024)).toFixed(2);
    return `${gb} GB`;
  }
  return `${mb.toFixed(2)} MB`;
}

function ProgressBar({
  progress,
  doubleUpscaylCounter,
  batchMode,
  resetImagePaths,
  batchProgressDetails: batchDetails,
  batchPaused,
}: {
  progress: string;
  doubleUpscaylCounter: number;
  batchMode: boolean;
  resetImagePaths: () => void;
  batchProgressDetails: BatchProgressDetails | null;
  batchPaused: boolean;
}) {
  const [batchProgress, setBatchProgress] = React.useState(0);
  const t = useAtomValue(translationAtom);
  const logit = useLogger();

  useEffect(() => {
    const progressString = progress.trim().replace(/\n/g, "");
    if (progressString.includes("Successful")) {
      setBatchProgress((prev) => prev + 1);
    }
  }, [progress]);

  const displayCurrent = batchDetails
    ? batchDetails.current
    : batchProgress;
  const displayTotal = batchDetails?.total ?? 0;
  const remaining = displayTotal > 0 ? displayTotal - displayCurrent : 0;

  const timeStr = useMemo(() => {
    if (!batchDetails?.estimatedTimeRemainingMs) return null;
    return formatTimeRemaining(batchDetails.estimatedTimeRemainingMs);
  }, [batchDetails?.estimatedTimeRemainingMs]);

  const totalTimeStr = useMemo(() => {
    if (!batchDetails?.estimatedTotalTimeMs) return null;
    return formatTimeRemaining(batchDetails.estimatedTotalTimeMs);
  }, [batchDetails?.estimatedTotalTimeMs]);

  const sizeStr = useMemo(() => {
    if (!batchDetails?.estimatedTotalSizeBytes) return null;
    return formatStorageSize(batchDetails.estimatedTotalSizeBytes);
  }, [batchDetails?.estimatedTotalSizeBytes]);

  const stopHandler = () => {
    window.electron.send(ELECTRON_COMMANDS.STOP);
    logit("🛑 Stopping Upscayl");
  };

  const pauseHandler = () => {
    window.electron.send(ELECTRON_COMMANDS.BATCH_PAUSE);
    logit("⏸️ Pausing batch");
  };

  const resumeHandler = () => {
    window.electron.send(ELECTRON_COMMANDS.BATCH_RESUME);
    logit("▶️ Resuming batch");
  };

  return (
    <div className="absolute z-50 flex h-full w-full flex-col items-center justify-center bg-base-300/50 backdrop-blur-lg">
      <div className="flex min-w-[420px] max-w-[90vw] flex-col items-center gap-2 rounded-btn bg-base-100/50 p-5 backdrop-blur-lg">
        <UpscaylSVGLogo className="spinner h-12 w-12" />

        <p className="rounded-full px-2 pb-2 font-bold">
          {batchMode &&
            `${t("APP.PROGRESS_BAR.BATCH_UPSCAYL_IN_PROGRESS_TITLE")} ${displayCurrent}${displayTotal > 0 ? ` / ${displayTotal}` : ""}`}
        </p>

        <div className="flex flex-col items-center gap-1">
          {progress !== "Hold on..." ? (
            <p className="text-sm font-bold">
              {progress}
              {!batchMode &&
                doubleUpscaylCounter > 0 &&
                "\nPass " + doubleUpscaylCounter}
            </p>
          ) : (
            <p className="text-sm font-bold">{progress}</p>
          )}

          {batchMode &&
            batchDetails?.folderTotal != null &&
            batchDetails.folderTotal > 1 && (
              <p className="text-xs font-medium text-base-content/80">
                {t("APP.PROGRESS_BAR.FOLDER_PROGRESS")
                  .replace("{current}", String(batchDetails.folderIndex ?? 0))
                  .replace("{total}", String(batchDetails.folderTotal))}
              </p>
            )}
          {batchMode &&
            (batchDetails?.currentFolderName != null ||
              batchDetails?.currentFileRelativePath != null) && (() => {
              const relPath = batchDetails?.currentFileRelativePath ?? "";
              const pathParts = relPath.split(/[/\\]/);
              const fileNameOnly = pathParts.length > 0 ? pathParts[pathParts.length - 1] : relPath;
              const subFolder =
                pathParts.length > 1 ? pathParts.slice(0, -1).join("/") : null;
              const row = (label: string, value: string, title?: string) => (
                <div
                  key={label}
                  className="flex w-full max-w-[380px] items-baseline gap-2 text-sm"
                >
                  <span className="shrink-0 font-bold text-base-content">
                    {label}
                  </span>
                  <span
                    className="min-w-0 truncate text-base-content/90"
                    title={title ?? value}
                  >
                    {value}
                  </span>
                </div>
              );
              return (
                <div className="w-full rounded-lg bg-base-200/60 px-3 py-2">
                  <div className="flex flex-col gap-1.5">
                    {batchDetails?.currentFolderName != null &&
                      row(
                        t("APP.PROGRESS_BAR.CURRENT_FOLDER"),
                        batchDetails.currentFolderName,
                        batchDetails.currentFolderName,
                      )}
                    {subFolder != null &&
                      row(
                        t("APP.PROGRESS_BAR.SUB_FOLDER"),
                        subFolder,
                        subFolder,
                      )}
                    {batchDetails?.currentFileRelativePath != null &&
                      row(
                        t("APP.PROGRESS_BAR.CURRENT_FILE"),
                        fileNameOnly,
                        batchDetails.currentFileRelativePath,
                      )}
                  </div>
                </div>
              );
            })()}
          {batchMode && displayTotal > 0 && (
            <p className="text-xs text-base-content/80">
              {t("APP.PROGRESS_BAR.REMAINING_IMAGES")
                .replace("{remaining}", String(remaining))
                .replace("{total}", String(displayTotal))}
            </p>
          )}
          {batchMode && totalTimeStr != null && displayTotal > 0 && (
            <p className="text-xs text-base-content/80">
              {t("APP.PROGRESS_BAR.ESTIMATED_TOTAL_TIME")
                .replace("{total}", String(displayTotal))
                .replace("{time}", totalTimeStr)}
            </p>
          )}
          {batchMode && timeStr != null && (
            <p className="text-xs text-base-content/80">
              {t("APP.PROGRESS_BAR.ESTIMATED_TIME_REMAINING").replace(
                "{time}",
                timeStr,
              )}
            </p>
          )}
          {batchMode && sizeStr != null && displayTotal > 0 && (
            <p className="text-xs text-base-content/80">
              {t("APP.PROGRESS_BAR.ESTIMATED_STORAGE")
                .replace("{total}", String(displayTotal))
                .replace("{size}", sizeStr)}
            </p>
          )}

          <p className="animate-pulse rounded-full px-2 pb-3 text-xs font-medium text-neutral-content/50">
            {t("APP.PROGRESS_BAR.IN_PROGRESS_TITLE")}
          </p>
        </div>

        <div className="flex gap-2">
          {batchMode && (
            <button
              onClick={batchPaused ? resumeHandler : pauseHandler}
              className="btn btn-outline"
            >
              {batchPaused
                ? t("APP.PROGRESS_BAR.RESUME_BUTTON_TITLE")
                : t("APP.PROGRESS_BAR.PAUSE_BUTTON_TITLE")}
            </button>
          )}
          <button onClick={stopHandler} className="btn btn-outline">
            {t("APP.PROGRESS_BAR.STOP_BUTTON_TITLE")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProgressBar;
