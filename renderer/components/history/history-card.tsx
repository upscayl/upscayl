import { useState } from "react";
import { useSetAtom } from "jotai";
import {
  ExternalLinkIcon,
  FolderIcon,
  FolderSearchIcon,
  ImageOffIcon,
  XIcon,
} from "lucide-react";
import { ELECTRON_COMMANDS } from "@common/electron-commands";
import getFilenameFromPath from "@common/get-file-name";
import { HistoryItem, removeHistoryItemAtom } from "@/atoms/history-atom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import useTranslation from "../hooks/use-translation";
import { HistoryViewer } from "./history-viewer";
import { imageUrl } from "./image-utils";

export const HistoryCard = ({ item }: { item: HistoryItem }) => {
  const t = useTranslation();
  const removeHistoryItem = useSetAtom(removeHistoryItemAtom);
  const [missing, setMissing] = useState(false);
  const [open, setOpen] = useState(false);
  const [maximize, setMaximize] = useState(false);
  const isBatch = item.kind === "batch-upscayl";
  const isRemoveBackground = item.kind === "remove-background";
  const title = item.settings?.name || getFilenameFromPath(item.outputPath);
  const kindLabel = {
    upscayl: t("Upscayl"),
    "double-upscayl": t("Double Upscayl"),
    "batch-upscayl": t("Batch Upscayl"),
    "remove-background": t("Remove background"),
  }[item.kind];
  const date = new Date(item.createdAt).toLocaleString();
  const details = [
    item.settings.model,
    item.settings.scale && `${item.settings.scale}x`,
  ].filter(Boolean);

  const openItem = () =>
    window.electron.send(ELECTRON_COMMANDS.OPEN_FOLDER, item.outputPath);
  const showItem = () =>
    window.electron.send(ELECTRON_COMMANDS.SHOW_IN_FOLDER, item.outputPath);

  return (
    <div className="group relative overflow-hidden rounded-3xl bg-card shadow-sm ring-1 ring-border/60 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:ring-primary/40">
      <button
        type="button"
        disabled={missing}
        onClick={() => (isBatch ? openItem() : setOpen(true))}
        className="block w-full text-left outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <div
          className={cn(
            "relative aspect-4/3 overflow-hidden bg-muted/40",
            isRemoveBackground && "transparency-grid",
          )}
        >
          {isBatch ? (
            <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-primary/15 to-transparent text-primary">
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
                "size-full transition-transform duration-500 group-hover:scale-105",
                isRemoveBackground ? "object-contain p-3" : "object-cover",
              )}
            />
          )}
          <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/75 via-black/30 to-transparent px-4 pt-10 pb-3 text-white">
            <p className="truncate text-sm font-semibold">{title}</p>
            <p className="mt-0.5 truncate text-xs text-white/70">
              {[date, ...details].join(" · ")}
            </p>
          </div>
        </div>
      </button>

      <Badge className="pointer-events-none absolute top-3 left-3 border-0 bg-black/40 text-white backdrop-blur-md">
        {kindLabel}
      </Badge>
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={missing}
          aria-label={isBatch ? t("Open folder") : t("Open image")}
          className="bg-black/40 text-white backdrop-blur-md hover:bg-black/60 hover:text-white"
          onClick={openItem}
        >
          <ExternalLinkIcon aria-hidden="true" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={missing}
          aria-label={t("Show in folder")}
          className="bg-black/40 text-white backdrop-blur-md hover:bg-black/60 hover:text-white"
          onClick={showItem}
        >
          <FolderSearchIcon aria-hidden="true" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={t("Remove from history")}
          className="bg-black/40 text-white backdrop-blur-md hover:bg-destructive hover:text-white"
          onClick={() => removeHistoryItem(item.id)}
        >
          <XIcon aria-hidden="true" />
        </Button>
      </div>

      {!isBatch && (
        <Dialog
          open={open}
          onOpenChange={(value) => {
            setOpen(value);
            if (!value) setMaximize(false);
          }}
        >
          <DialogContent
            className={cn(
              "flex flex-col gap-3 p-3",
              maximize
                ? "h-screen w-screen max-w-none rounded-none sm:max-w-none"
                : "h-[88vh] w-[92vw] rounded-3xl sm:max-w-[min(92vw,1400px)]",
            )}
          >
            <div className="flex items-start justify-between gap-4 pr-10 pl-1">
              <div className="min-w-0">
                <DialogTitle className="truncate text-base font-semibold">
                  {title}
                </DialogTitle>
                <DialogDescription className="mt-0.5 truncate text-xs">
                  {[kindLabel, date, ...details].join(" · ")}
                </DialogDescription>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button variant="ghost" size="sm" onClick={openItem}>
                  <ExternalLinkIcon aria-hidden="true" />
                  {t("Open image")}
                </Button>
                <Button variant="ghost" size="sm" onClick={showItem}>
                  <FolderSearchIcon aria-hidden="true" />
                  {t("Show in folder")}
                </Button>
              </div>
            </div>
            <div className="min-h-0 flex-1">
              <HistoryViewer
                item={item}
                maximize={maximize}
                setMaximize={setMaximize}
                onMissing={() => {
                  setMissing(true);
                  setOpen(false);
                }}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
