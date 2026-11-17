import { useState } from "react";
import { useAtomValue } from "jotai";
import { FolderOpenIcon, HistoryIcon, Trash2Icon } from "lucide-react";
import { ELECTRON_COMMANDS } from "@common/electron-commands";
import { historyAtom } from "@/atoms/history-atom";
import { Button } from "@/components/ui/button";
import useTranslation from "../hooks/use-translation";
import { ClearHistoryDialog } from "./clear-history-dialog";
import { HistoryCard } from "./history-card";

const History = () => {
  const t = useTranslation();
  // Entries saved by an earlier build have no kind/outputPath.
  const items = useAtomValue(historyAtom).filter(
    (item) => item.kind && item.outputPath,
  );
  const [showClearDialog, setShowClearDialog] = useState(false);

  return (
    <section className="flex size-full min-h-0 flex-col overflow-hidden rounded-4xl border bg-secondary glass-panel">
      <header className="flex shrink-0 items-start justify-between gap-4 border-b border-border/70 px-5 py-4 sm:px-6">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <HistoryIcon className="size-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight">
              {t("History")}
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {t(
                "Copies of your upscayls and background removals, kept in your History folder.",
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              window.electron.send(ELECTRON_COMMANDS.OPEN_HISTORY_FOLDER)
            }
          >
            <FolderOpenIcon aria-hidden="true" />
            {t("Open folder")}
          </Button>
          {items.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowClearDialog(true)}
            >
              <Trash2Icon aria-hidden="true" />
              {t("Clear all")}
            </Button>
          )}
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
        {items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <HistoryIcon
                className="size-7"
                strokeWidth={1.8}
                aria-hidden="true"
              />
            </div>
            <p className="text-base font-semibold">{t("No history yet")}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t("Finished images will show up here.")}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {items.map((item) => (
              <HistoryCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>

      <ClearHistoryDialog
        open={showClearDialog}
        onOpenChange={setShowClearDialog}
      />
    </section>
  );
};

export default History;
