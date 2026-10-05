"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  AlertCircleIcon,
  CheckCircle2Icon,
  DownloadIcon,
  EyeIcon,
  FileImageIcon,
  ImageOffIcon,
  LoaderCircleIcon,
  RefreshCwIcon,
  ShieldCheckIcon,
  SparklesIcon,
  UploadIcon,
  XIcon,
} from "lucide-react";
import { ELECTRON_COMMANDS } from "@common/electron-commands";
import {
  RemoveBackgroundDone,
  RemoveBackgroundError,
  RemoveBackgroundProgress,
} from "@common/types/types";
import { VALID_IMAGE_FORMATS } from "@/lib/valid-formats";
import { sanitizePath } from "@common/sanitize-path";
import getFilenameFromPath from "@common/get-file-name";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import useTranslation from "../hooks/use-translation";

type RemoveBackgroundStatus =
  | "empty"
  | "ready"
  | "processing"
  | "complete"
  | "error";
type RemoveBackgroundStage = "decode" | "inference" | "encode";

const stageOrder: RemoveBackgroundStage[] = ["decode", "inference", "encode"];

const formatBytes = (bytes: number | null) => {
  if (!bytes || bytes < 1) return "";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const imageUrl = (filePath: string) =>
  filePath ? `file:///${sanitizePath(filePath)}` : "";

const RemoveBackground = () => {
  const t = useTranslation();
  const [status, setStatus] = useState<RemoveBackgroundStatus>("empty");
  const [inputPath, setInputPath] = useState("");
  const [resultPath, setResultPath] = useState("");
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [stage, setStage] = useState<RemoveBackgroundStage | null>(null);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const cancelRequested = useRef(false);

  const filename = useMemo(
    () => getFilenameFromPath(inputPath) || t("No image selected"),
    [inputPath, t],
  );
  const previewPath =
    status === "complete" && !showOriginal ? resultPath : inputPath;
  const previewAlt =
    status === "complete" && !showOriginal
      ? t("Background removed preview")
      : t("Original image preview");

  const importImage = async (path: string) => {
    if (!path) return;

    if (status === "processing") {
      window.electron.send(ELECTRON_COMMANDS.REMOVE_BACKGROUND_STOP);
    }

    const extension = path.split(".").pop()?.toLowerCase() ?? "";
    if (
      !VALID_IMAGE_FORMATS.includes(
        extension as (typeof VALID_IMAGE_FORMATS)[number],
      )
    ) {
      setStatus("error");
      setError(
        t(
          "This image format is not supported. Choose a PNG, JPG, JPEG, JFIF, or WEBP image.",
        ),
      );
      return;
    }

    setInputPath(path);
    setResultPath("");
    setDimensions({ width: 0, height: 0 });
    setStatus("ready");
    setStage(null);
    setError("");
    setShowOriginal(false);
    cancelRequested.current = false;

    try {
      const size = await window.electron.invoke(
        ELECTRON_COMMANDS.GET_FILE_SIZE,
        path,
      );
      setFileSize(typeof size === "number" ? size : null);
    } catch {
      setFileSize(null);
    }
  };

  const browseForImage = async () => {
    const path = await window.electron.invoke(ELECTRON_COMMANDS.SELECT_FILE);
    if (typeof path === "string") await importImage(path);
  };

  const handleDrop = async (event: React.DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    const path = file ? window.electron.getPathForFile(file) : "";
    if (!path) return;

    const pathType = await window.electron.invoke(
      ELECTRON_COMMANDS.GET_DROPPED_PATH_TYPE,
      path,
    );
    if (pathType !== "file") {
      setStatus("error");
      setError(
        t("Drop one image file at a time. Folders are not supported here."),
      );
      return;
    }
    await importImage(path);
  };

  const startProcessing = () => {
    if (!inputPath || status === "processing") return;
    cancelRequested.current = false;
    setStatus("processing");
    setStage("decode");
    setError("");
    setResultPath("");
    window.electron.send(ELECTRON_COMMANDS.REMOVE_BACKGROUND, {
      inputPath,
    });
  };

  const cancelProcessing = () => {
    cancelRequested.current = true;
    window.electron.send(ELECTRON_COMMANDS.REMOVE_BACKGROUND_STOP);
    setStatus("ready");
    setStage(null);
  };

  const reset = () => {
    if (status === "processing")
      window.electron.send(ELECTRON_COMMANDS.REMOVE_BACKGROUND_STOP);
    setStatus("empty");
    setInputPath("");
    setResultPath("");
    setDimensions({ width: 0, height: 0 });
    setFileSize(null);
    setStage(null);
    setError("");
    setShowOriginal(false);
  };

  const replaceImage = async () => {
    if (!resultPath) return;
    const nextPath = resultPath;
    const resultDimensions = dimensions;
    await importImage(nextPath);
    setDimensions(resultDimensions);
    toast(t("Image replaced"), {
      description: t("The transparent PNG is now your working image."),
    });
  };

  const exportImage = async () => {
    if (!resultPath) return;
    try {
      const exportPath = await window.electron.invoke(
        ELECTRON_COMMANDS.EXPORT_REMOVE_BACKGROUND,
        {
          sourcePath: resultPath,
          defaultName: filename,
        },
      );
      if (exportPath) {
        toast(t("Image exported"), {
          description: t("Saved as a transparent PNG."),
        });
      }
    } catch (exportError) {
      toast(t("Export failed"), {
        description:
          exportError instanceof Error
            ? exportError.message
            : String(exportError),
      });
    }
  };

  useEffect(() => {
    const onProgress = (_event: unknown, payload: RemoveBackgroundProgress) => {
      if (
        cancelRequested.current ||
        !payload?.stage ||
        !stageOrder.includes(payload.stage)
      )
        return;
      setStatus("processing");
      setStage(payload.stage);
    };
    const onDone = (_event: unknown, payload: RemoveBackgroundDone) => {
      if (cancelRequested.current || !payload?.outputPath) return;
      setResultPath(payload.outputPath);
      setDimensions({ width: payload.width, height: payload.height });
      setStage(null);
      setStatus("complete");
      setShowOriginal(false);
      cancelRequested.current = false;
    };
    const onError = (_event: unknown, payload: RemoveBackgroundError) => {
      if (cancelRequested.current && payload?.message?.includes("cancelled")) {
        cancelRequested.current = false;
        return;
      }
      setStatus("error");
      setStage(null);
      setError(
        payload?.message || t("Background removal failed. Try another image."),
      );
      cancelRequested.current = false;
    };

    window.electron.on(
      ELECTRON_COMMANDS.REMOVE_BACKGROUND_PROGRESS,
      onProgress,
    );
    window.electron.on(ELECTRON_COMMANDS.REMOVE_BACKGROUND_DONE, onDone);
    window.electron.on(ELECTRON_COMMANDS.REMOVE_BACKGROUND_ERROR, onError);

    return () => {
      window.electron.off(
        ELECTRON_COMMANDS.REMOVE_BACKGROUND_PROGRESS,
        onProgress,
      );
      window.electron.off(ELECTRON_COMMANDS.REMOVE_BACKGROUND_DONE, onDone);
      window.electron.off(ELECTRON_COMMANDS.REMOVE_BACKGROUND_ERROR, onError);
      window.electron.send(ELECTRON_COMMANDS.REMOVE_BACKGROUND_STOP);
    };
  }, [t]);

  return (
    <section className="flex size-full min-h-0 flex-col overflow-hidden rounded-4xl border bg-secondary glass-panel">
      <header className="flex shrink-0 items-start justify-between gap-4 border-b border-border/70 px-5 py-4 sm:px-6">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <ImageOffIcon className="size-5" aria-hidden="true" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold tracking-tight">
                {t("Remove Background")}
              </h2>
              <Badge
                variant="secondary"
                className="border border-border/70 bg-background/50"
              >
                {t("Local & private")}
              </Badge>
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {t("Create a clean transparent PNG on your computer.")}
            </p>
          </div>
        </div>
        {status !== "empty" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={reset}
            disabled={status === "processing"}
            aria-label={t("Start over")}
          >
            <RefreshCwIcon aria-hidden="true" />
            <span className="hidden sm:inline">{t("Start over")}</span>
          </Button>
        )}
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
        {status === "empty" ? (
          <div className="mx-auto flex h-full max-w-4xl flex-col justify-center gap-8 py-6">
            <div className="max-w-2xl">
              <p className="mb-3 text-sm font-medium text-primary">
                {t("A faster clean-up workflow")}
              </p>
              <h3 className="max-w-xl text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">
                {t("Make the subject stand out.")}
              </h3>
              <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
                {t(
                  "Drop in a photo and let WithoutBG remove the background locally. Your image stays on this computer, and the result keeps its original dimensions.",
                )}
              </p>
            </div>

            <button
              type="button"
              onClick={() => void browseForImage()}
              onDragEnter={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragOver={(event) => event.preventDefault()}
              onDragLeave={(event) => {
                event.preventDefault();
                setIsDragging(false);
              }}
              onDrop={(event) => void handleDrop(event)}
              className={cn(
                "group flex min-h-64 flex-col items-center justify-center rounded-3xl border-2 border-dashed px-6 text-center transition-all duration-200",
                isDragging
                  ? "scale-[1.01] border-primary bg-primary/10 shadow-lg shadow-primary/10"
                  : "border-border bg-background/30 hover:border-primary/60 hover:bg-primary/5",
              )}
            >
              <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform duration-200 group-hover:-translate-y-1">
                <UploadIcon
                  className="size-7"
                  strokeWidth={1.8}
                  aria-hidden="true"
                />
              </div>
              <span className="text-base font-semibold">
                {t("Drop an image here")}
              </span>
              <span className="mt-1 text-sm text-muted-foreground">
                {t("or click to browse from your computer")}
              </span>
              <span className="mt-4 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                PNG · JPG · JPEG · WEBP
              </span>
            </button>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                [
                  ShieldCheckIcon,
                  t("Private by design"),
                  t("Processing stays offline on your device."),
                ],
                [
                  SparklesIcon,
                  t("Fine detail preserved"),
                  t("Soft edges and hair stay natural."),
                ],
                [
                  FileImageIcon,
                  t("Ready to use"),
                  t("Export a transparent PNG in one click."),
                ],
              ].map(([Icon, title, description]) => (
                <div
                  key={title as string}
                  className="rounded-2xl border border-border/70 bg-background/30 p-4"
                >
                  <Icon
                    className="mb-3 size-4 text-primary"
                    aria-hidden="true"
                  />
                  <p className="text-sm font-semibold">{title as string}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {description as string}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto flex h-full max-w-6xl flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3 px-1">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{filename}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {dimensions.width > 0 && dimensions.height > 0
                    ? `${dimensions.width} × ${dimensions.height}`
                    : t("Image dimensions loading…")}
                  {fileSize ? ` · ${formatBytes(fileSize)}` : ""}
                </p>
              </div>
              {status === "complete" && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowOriginal((current) => !current)}
                    aria-pressed={showOriginal}
                  >
                    <EyeIcon aria-hidden="true" />
                    {showOriginal ? t("Show cutout") : t("Show original")}
                  </Button>
                  <Badge className="border border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300">
                    <CheckCircle2Icon aria-hidden="true" />
                    {t("Background removed")}
                  </Badge>
                </div>
              )}
            </div>

            <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
              <div className="flex min-h-96 min-w-0 flex-col overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm">
                <div className="transparency-grid relative min-h-0 flex-1 overflow-hidden">
                  {previewPath && (
                    <img
                      src={imageUrl(previewPath)}
                      alt={previewAlt}
                      draggable="false"
                      onLoad={(event) => {
                        if (status !== "complete" || !showOriginal) {
                          setDimensions({
                            width: event.currentTarget.naturalWidth,
                            height: event.currentTarget.naturalHeight,
                          });
                        }
                      }}
                      className="absolute inset-0 size-full object-contain p-6 sm:p-10"
                    />
                  )}

                  {status === "processing" && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/65 p-6 text-center backdrop-blur-[2px]">
                      <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                        <LoaderCircleIcon
                          className="size-6 animate-spin"
                          aria-hidden="true"
                        />
                      </div>
                      <p className="mt-4 text-base font-semibold">
                        {t("Removing the background…")}
                      </p>
                      <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                        {t(
                          "This happens locally. You can keep an eye on each step below.",
                        )}
                      </p>
                    </div>
                  )}

                  {status === "error" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80 p-6 backdrop-blur-[2px]">
                      <div className="max-w-md text-center">
                        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
                          <AlertCircleIcon
                            className="size-6"
                            aria-hidden="true"
                          />
                        </div>
                        <p className="mt-4 text-base font-semibold">
                          {t("We couldn't remove that background")}
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                          {error}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 px-4 py-3 text-xs text-muted-foreground sm:px-5">
                  <span>
                    {status === "complete" && !showOriginal
                      ? t("Transparent preview")
                      : t("Original preview")}
                  </span>
                  {status === "complete" && (
                    <button
                      type="button"
                      className="font-medium text-primary underline-offset-4 hover:underline"
                      onClick={() => setShowOriginal((current) => !current)}
                    >
                      {showOriginal
                        ? t("View cutout")
                        : t("Compare with original")}
                    </button>
                  )}
                </div>
              </div>

              <aside className="flex flex-col gap-3">
                {status === "processing" ? (
                  <div className="rounded-3xl border border-border/70 bg-card p-5 shadow-sm">
                    <p className="text-sm font-semibold">
                      {t("Processing locally")}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {t(
                        "WithoutBG is working through the image. Larger photos can take a little longer.",
                      )}
                    </p>
                    <div className="mt-5 space-y-3">
                      {stageOrder.map((stageName, index) => {
                        const currentIndex = stage
                          ? stageOrder.indexOf(stage)
                          : 0;
                        const isDone = index < currentIndex;
                        const isCurrent = stageName === stage;
                        const label =
                          stageName === "decode"
                            ? t("Preparing image")
                            : stageName === "inference"
                              ? t("Removing background")
                              : t("Finishing PNG");
                        return (
                          <div
                            key={stageName}
                            className="flex items-center gap-3 text-sm"
                          >
                            <div
                              className={cn(
                                "flex size-7 items-center justify-center rounded-full border",
                                isDone || isCurrent
                                  ? "border-primary bg-primary/10 text-primary"
                                  : "border-border text-muted-foreground",
                              )}
                            >
                              {isDone ? (
                                <CheckCircle2Icon
                                  className="size-4"
                                  aria-hidden="true"
                                />
                              ) : isCurrent ? (
                                <LoaderCircleIcon
                                  className="size-4 animate-spin"
                                  aria-hidden="true"
                                />
                              ) : (
                                <span className="text-xs">{index + 1}</span>
                              )}
                            </div>
                            <span
                              className={cn(
                                isCurrent
                                  ? "font-medium"
                                  : "text-muted-foreground",
                              )}
                            >
                              {label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <Button
                      variant="outline"
                      className="mt-6 w-full"
                      onClick={cancelProcessing}
                    >
                      <XIcon aria-hidden="true" />
                      {t("Cancel")}
                    </Button>
                  </div>
                ) : status === "complete" ? (
                  <div className="rounded-3xl border border-border/70 bg-card p-5 shadow-sm">
                    <p className="text-sm font-semibold">
                      {t("Your cutout is ready")}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {t(
                        "The original dimensions are preserved and the background is transparent.",
                      )}
                    </p>
                    <div className="mt-5 grid gap-2">
                      <Button
                        className="h-11 w-full"
                        onClick={() => void exportImage()}
                      >
                        <DownloadIcon aria-hidden="true" />
                        {t("Export transparent PNG")}
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => void replaceImage()}
                      >
                        <RefreshCwIcon aria-hidden="true" />
                        {t("Replace image")}
                      </Button>
                    </div>
                    <div className="mt-5 rounded-2xl bg-muted/60 p-3 text-xs leading-relaxed text-muted-foreground">
                      <span className="font-medium text-foreground">
                        {t("Tip:")}
                      </span>{" "}
                      {t(
                        "Use the checkerboard to confirm transparency before exporting.",
                      )}
                    </div>
                  </div>
                ) : status === "error" ? (
                  <div className="rounded-3xl border border-destructive/20 bg-destructive/5 p-5">
                    <p className="text-sm font-semibold text-destructive">
                      {t("Something went wrong")}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {error}
                    </p>
                    <div className="mt-5 grid gap-2">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={startProcessing}
                        disabled={!inputPath}
                      >
                        <RefreshCwIcon aria-hidden="true" />
                        {t("Try again")}
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full"
                        onClick={reset}
                      >
                        {t("Choose another image")}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-3xl border border-border/70 bg-card p-5 shadow-sm">
                    <p className="text-sm font-semibold">
                      {t("Ready when you are")}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {t("Processing stays offline on your device.")}
                    </p>
                    <Button
                      className="mt-5 h-11 w-full"
                      onClick={startProcessing}
                    >
                      <SparklesIcon aria-hidden="true" />
                      {t("Remove background")}
                    </Button>
                    <Button
                      variant="outline"
                      className="mt-2 w-full"
                      onClick={() => void browseForImage()}
                    >
                      <UploadIcon aria-hidden="true" />
                      {t("Choose a different image")}
                    </Button>
                  </div>
                )}

                <div className="rounded-3xl border border-border/70 bg-background/25 p-4">
                  <p className="text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                    {t("What stays the same")}
                  </p>
                  <div className="mt-3 space-y-2 text-xs text-muted-foreground">
                    <p className="flex items-center gap-2">
                      <CheckCircle2Icon
                        className="size-3.5 text-primary"
                        aria-hidden="true"
                      />
                      {t("Original pixel dimensions")}
                    </p>
                    <p className="flex items-center gap-2">
                      <CheckCircle2Icon
                        className="size-3.5 text-primary"
                        aria-hidden="true"
                      />
                      {t("Soft edges and fine detail")}
                    </p>
                    <p className="flex items-center gap-2">
                      <CheckCircle2Icon
                        className="size-3.5 text-primary"
                        aria-hidden="true"
                      />
                      {t("Your source file")}
                    </p>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default RemoveBackground;
