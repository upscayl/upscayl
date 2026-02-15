"use client";

import React from "react";
import { useAtomValue } from "jotai";
import { translationAtom } from "@/atoms/translations-atom";
import type { BatchStats } from "@common/types/types";

function formatDateTime(ms: number): string {
  const d = new Date(ms);
  return d.toLocaleString(undefined, {
    dateStyle: "short",
    timeStyle: "medium",
  });
}

function formatDuration(ms: number): string {
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

type BatchStatsModalProps = {
  stats: BatchStats;
  onClose: () => void;
};

export default function BatchStatsModal({ stats, onClose }: BatchStatsModalProps) {
  const t = useAtomValue(translationAtom);

  const rows: { label: string; value: string }[] = [
    {
      label: t("APP.PROGRESS.BATCH_STATS.START_TIME"),
      value: formatDateTime(stats.startTime),
    },
    {
      label: t("APP.PROGRESS.BATCH_STATS.END_TIME"),
      value: formatDateTime(stats.endTime),
    },
    {
      label: t("APP.PROGRESS.BATCH_STATS.TOTAL_TIME"),
      value: formatDuration(stats.totalTimeMs),
    },
    {
      label: t("APP.PROGRESS.BATCH_STATS.TOTAL_IMAGES"),
      value: String(stats.totalImages),
    },
    {
      label: t("APP.PROGRESS.BATCH_STATS.AVG_TIME_PER_IMAGE"),
      value: formatDuration(stats.avgTimePerImageMs),
    },
    {
      label: t("APP.PROGRESS.BATCH_STATS.AVG_SIZE_PER_IMAGE"),
      value: formatStorageSize(stats.avgSizeBytes),
    },
    {
      label: t("APP.PROGRESS.BATCH_STATS.TOTAL_SIZE"),
      value: formatStorageSize(stats.totalSizeBytes),
    },
  ];

  return (
    <div className="modal modal-open">
      <div className="modal-box max-w-md">
        <h3 className="text-lg font-bold">
          {t("APP.PROGRESS.BATCH_STATS.TITLE")}
        </h3>
        <div className="mt-4 flex flex-col gap-2">
          {rows.map(({ label, value }) => (
            <div
              key={label}
              className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1"
            >
              <span className="text-sm font-medium text-base-content/90">
                {label}
              </span>
              <span className="text-sm text-base-content/70">{value}</span>
            </div>
          ))}
        </div>
        <div className="modal-action">
          <button type="button" className="btn btn-primary" onClick={onClose}>
            {t("APP.DIALOG_BOX.CLOSE")}
          </button>
        </div>
      </div>
      <div className="modal-backdrop bg-black/50" onClick={onClose} aria-hidden />
    </div>
  );
}
