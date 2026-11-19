import { useState } from "react";
import { FolderIcon } from "lucide-react";
import { HistoryItem } from "@/atoms/history-atom";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import useTranslation from "../hooks/use-translation";
import { HistoryCard } from "./history-card";
import { imageUrl } from "./image-utils";

export default function HistoryFolderCard({ items }: { items: HistoryItem[] }) {
  const t = useTranslation();
  const [open, setOpen] = useState(false);

  const cover = items[0];
  const latest = items[items.length - 1];
  const date = new Date(latest.createdAt).toLocaleString();
  const details = [
    latest.settings.model,
    latest.settings.scale && `${latest.settings.scale}x`,
  ].filter(Boolean);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative block w-full overflow-hidden rounded-3xl bg-card text-left shadow-sm ring-1 ring-border/60 transition-all duration-300 outline-none hover:-translate-y-0.5 hover:shadow-xl hover:ring-primary/40 focus-visible:ring-2 focus-visible:ring-primary"
      >
        <div className="flex aspect-4/3 items-center justify-center bg-linear-to-br from-primary/15 to-transparent text-primary">
          <FolderIcon
            className="size-12"
            strokeWidth={1.5}
            aria-hidden="true"
          />

          <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/75 via-black/30 to-transparent px-4 pt-10 pb-3 text-white">
            <p className="truncate text-sm font-semibold">
              {t("Batch")} · {items.length} {t("images")}
            </p>
            <p className="mt-0.5 truncate text-xs text-white/70">
              {[date, ...details].join(" · ")}
            </p>
          </div>
        </div>
      </button>

      <Badge className="pointer-events-none absolute top-3 left-3 border-0 bg-black/40 text-white backdrop-blur-md">
        <FolderIcon className="mr-1 size-3" aria-hidden="true" />
        {items.length}
      </Badge>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex h-[88vh] w-[92vw] flex-col gap-3 rounded-3xl p-3 sm:max-w-[min(92vw,1400px)]">
          <div className="pr-10 pl-1">
            <DialogTitle className="text-base font-semibold">
              {t("Batch")} · {items.length} {t("images")}
            </DialogTitle>
            <DialogDescription className="mt-0.5 text-xs">
              {[date, ...details].join(" · ")}
            </DialogDescription>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="grid grid-cols-2 gap-3 p-1 sm:grid-cols-3 lg:grid-cols-4">
              {items.map((item) => (
                <HistoryCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
