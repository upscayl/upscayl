import { useState, type CSSProperties } from "react";
import { useSetAtom } from "jotai";
import dayjs from "dayjs";
import {
  FolderIcon,
  ImageOffIcon,
} from "lucide-react";
import { EasingDefinition, motion } from "motion/react";
import { ELECTRON_COMMANDS } from "@common/electron-commands";
import getFilenameFromPath from "@common/get-file-name";
import {
  HistoryItem,
  removeHistoryBatchAtom,
  removeHistoryItemAtom,
} from "@/atoms/history-atom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  FolderSearchIcon,
  SquareArrowOutUpRightIcon,
  TrashIcon,
  useIconHover,
} from "@/components/animated-icons";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import useTranslation from "../hooks/use-translation";
import { HistoryViewer } from "./history-viewer";
import { imageUrl } from "./image-utils";
import { Separator } from "../ui/separator";
import { ScrollArea } from "../ui/scroll-area";

const EASE = [0.25, 0.46, 0.45, 0.94] as EasingDefinition;
const SOFT_MASK = "linear-gradient(to top, #000 45%, transparent 100%)";

export const HistoryCard = ({ items }: { items: HistoryItem[] }) => {
  const t = useTranslation();
  const removeHistoryItem = useSetAtom(removeHistoryItemAtom);
  const removeHistoryBatch = useSetAtom(removeHistoryBatchAtom);
  const [missing, setMissing] = useState(false);
  const [open, setOpen] = useState(false);
  const openHover = useIconHover();
  const showHover = useIconHover();
  const removeHover = useIconHover();
  const showDialogHover = useIconHover();
  const [showDetails, setShowDetails] = useState(false);

  const isBatch = items.length > 1;
  const item = items[items.length - 1];
  const batchId = items[0]?.batchId;
  const targetPath = items[0]?.outputPath;
  const isRemoveBackground = !isBatch && item.kind === "remove-background";

  const title = isBatch
    ? `${t("Batch Upscayl")} · ${items.length}`
    : getFilenameFromPath(item.inputPath);
  const date = new Date(item.createdAt).toLocaleString();

  const kindLabel = {
    upscayl: t("Upscayl"),
    "double-upscayl": t("Double Upscayl"),
    // "batch-upscayl": t("Batch Upscayl"),
    "remove-background": t("Remove background"),
  }[item.kind];

  const details = (() => {
    const model = item.settings.model;
    const shortModel = model.replace(/-x?\d+(x|plus)?.*$/i, "") || model;
    return [
      shortModel.replace("-", " "),
      item.settings.scale && `${item.settings.scale}x`,
    ].filter(Boolean);
  })();

  const summary = [isBatch ? date : null, ...details]
    .filter(Boolean)
    .join(" · ");

  const openItem = () =>
    targetPath &&
    window.electron.send(ELECTRON_COMMANDS.OPEN_FOLDER, targetPath);
  const showItem = () =>
    targetPath &&
    window.electron.send(ELECTRON_COMMANDS.SHOW_IN_FOLDER, targetPath);
  // The shared DialogContent hardcodes a grid display plus a small width and
  // radius that win over utility classes on stylesheet order, so the geometry
  // is set inline instead: compact and translucent for a batch, fullscreen for
  // a single image (which the card opens straight into).
  const dialogStyle: CSSProperties = isBatch
    ? {
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
        padding: "0.875rem",
        maxWidth: "48rem",
        maxHeight: "80vh",
        borderRadius: "1rem",
        backgroundColor: "color-mix(in oklab, var(--popover) 88%, transparent)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
      }
    : {
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        padding: "1rem",
        width: "100vw",
        height: "100vh",
        maxWidth: "none",
        borderRadius: 0,
      };

  const removeItem = () => {
    if (isBatch) {
      if (batchId) removeHistoryBatch(batchId);
      return;
    }
    removeHistoryItem(item.id);
  };

  return (
    <div className="rounded-4xl border border-border/40 bg-card p-1">
      <div
        className="group relative overflow-hidden rounded-3xl bg-card shadow-sm transition-all duration-300 hover:ring-primary/40"
        style={{ clipPath: "inset(0 round 0.5rem)", isolation: "isolate" }}
        onFocus={() => setShowDetails(true)}
        onMouseEnter={() => setShowDetails(true)}
        onMouseLeave={() => setShowDetails(false)}
        onBlur={() => setShowDetails(false)}
      >
        <button
          type="button"
          disabled={missing}
          // A single image opens straight into the fullscreen preview; the dialog
          // is only there to browse a batch.
          onClick={() => setOpen(true)}
          className="block w-full text-left outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <div
            className={cn(
              "relative aspect-10/7 overflow-hidden bg-muted/40",
              isRemoveBackground && "transparency-grid",
            )}
          >
            {isBatch ? (
              <div className="flex size-full items-center justify-center bg-linear-to-br from-primary/15 to-transparent text-primary">
                <FolderIcon
                  className="size-12"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
              </div>
            ) : missing ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
                <ImageOffIcon className="size-8" aria-hidden="true" />
                {t("File not found")}
              </div>
            ) : (
              <img
                src={imageUrl(item.outputPath)}
                alt={title}
                loading="lazy"
                draggable={false}
                onError={() => setMissing(true)}
                className={cn(
                  "size-full transition-transform duration-500",
                  isRemoveBackground ? "object-contain p-3" : "object-cover",
                )}
              />
            )}
          </div>
        </button>

        {isBatch ? (
          <div className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-background py-1 pr-3 pl-1 text-sm font-medium">
            <div className="rounded-full bg-primary p-1 text-primary-foreground">
              <FolderIcon className="size-4" />
            </div>
            {items.length} Images
          </div>
        ) : (
          kindLabel && (
            <>
              <div className="absolute top-2 left-3 z-1 font-semibold">
                {dayjs(item.createdAt).format("DD.MM.YYYY")}
              </div>

              <div className="pointer-events-none absolute inset-x-0 top-0 h-[20%] bg-linear-to-b from-black/80 via-black/40 to-transparent" />
            </>
          )
        )}

        <motion.div
          initial={false}
          animate={{ opacity: showDetails ? 1 : 0 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[38%] backdrop-blur-[6px]"
          style={{ maskImage: SOFT_MASK, WebkitMaskImage: SOFT_MASK }}
        />

        <motion.div
          initial={false}
          animate={{ opacity: showDetails ? 1 : 0 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="pointer-events-none absolute inset-x-0 bottom-0 z-1 h-[38%] bg-linear-to-t from-black/80 via-black/40 to-transparent"
        />

        <motion.div
          initial={false}
          animate={
            showDetails
              ? { opacity: 1, y: 0, scale: 1 }
              : { opacity: 0, y: 6, scale: 0.99 }
          }
          transition={{ duration: showDetails ? 0.3 : 0.18, ease: "easeOut" }}
          className="pointer-events-none absolute inset-x-0 bottom-0 z-2 px-4 pt-10 pb-3 text-white"
        >
          <p className="truncate text-sm font-semibold capitalize">{title}</p>
          <p className="mt-0.5 truncate text-xs text-white/70 capitalize">
            {summary}
          </p>
        </motion.div>

        <div className="absolute top-2 right-2 flex gap-1 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
          {!isBatch && (
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={missing}
              aria-label={t("Open image")}
              className="bg-black/40 text-white backdrop-blur-md hover:bg-black/60 hover:text-white"
              onClick={openItem}
              {...openHover.hoverProps}
            >
              <SquareArrowOutUpRightIcon
                ref={openHover.ref}
                className="size-4"
              />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            disabled={missing}
            aria-label={t("Show in folder")}
            className="bg-black/40 text-white backdrop-blur-md hover:bg-black/60 hover:text-white"
            onClick={showItem}
            {...showHover.hoverProps}
          >
            <FolderSearchIcon ref={showHover.ref} className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            disabled={isBatch && !batchId}
            aria-label={t("Remove from history")}
            className="bg-black/40 text-white backdrop-blur-md hover:bg-destructive hover:text-white"
            onClick={removeItem}
            {...removeHover.hoverProps}
          >
            <TrashIcon ref={removeHover.ref} className="size-4" />
          </Button>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent
            style={dialogStyle}
            className={cn(isBatch && "shadow-2xl")}
          >
            <div className="flex items-center justify-between gap-4 pr-8 pl-1">
              <div className={cn("min-w-0", !isBatch && "sr-only")}>
                <DialogTitle
                  className={cn(
                    "truncate font-semibold",
                    isBatch ? "text-sm" : "text-base",
                  )}
                >
                  {title}
                </DialogTitle>
                <DialogDescription
                  className={cn(
                    "mt-0.5 truncate text-xs",
                    isBatch && "text-muted-foreground",
                  )}
                >
                  {isBatch
                    ? summary
                    : [kindLabel, date, ...details].join(" · ")}
                </DialogDescription>
              </div>
            </div>

            {isBatch && <Separator />}

            <div className={cn("min-h-0 flex-1", isBatch && "overflow-y-auto")}>
              {isBatch ? (
                <ScrollArea className="max-h-[40vh]">
                  <div className="grid grid-cols-2 gap-2.5 p-0.5 sm:grid-cols-3">
                    {items.map((child) => (
                      <HistoryCard key={child.id} items={[child]} />
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <HistoryViewer
                  item={item}
                  maximize
                  onMissing={() => {
                    setMissing(true);
                    setOpen(false);
                  }}
                />
              )}
            </div>
            {isBatch && (
              <DialogFooter>
                <div className="flex shrink-0 gap-1">
                  <DialogClose>
                    <Button variant="secondary">Close</Button>
                  </DialogClose>
                  <Button onClick={showItem} {...showDialogHover.hoverProps}>
                    <FolderSearchIcon
                      ref={showDialogHover.ref}
                      className="size-4"
                    />
                    {t("Show in folder")}
                  </Button>
                </div>
              </DialogFooter>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
