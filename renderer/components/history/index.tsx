import { useEffect, useMemo, useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { HistoryIcon } from "lucide-react";
import {
  historyAtom,
  HistoryItem,
  loadHistoryItems,
} from "@/atoms/history-atom";
import { Button } from "@/components/ui/button";
import useTranslation from "../hooks/use-translation";
import { ClearHistoryDialog } from "./clear-history-dialog";
import { HistoryCard } from "./history-card";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { cn } from "@/lib/utils";
import { HistoryEntryKind } from "@common/types/types";
import { motion } from "motion/react";
import {
  ArrowDownWideNarrowIcon,
  ArrowUpNarrowWideIcon,
  EraserIcon,
  FoldersIcon,
  LayoutGridIcon,
  SearchPlusIcon,
  Trash2Icon,
  useIconHover,
  type AnimatedIcon,
} from "@/components/animated-icons";

type HistoryGroup = {
  type: "single" | "batch";
  key: string;
  createdAt: number;
  items: HistoryItem[];
};

const toGroup = (
  type: HistoryGroup["type"],
  id: string,
  group: HistoryItem[],
): HistoryGroup => ({
  type,
  key: `${type}-${id}`,
  createdAt: group[group.length - 1].createdAt,
  items: group,
});

const FILTERS = [
  { key: "all", label: "All", icon: LayoutGridIcon },
  { key: "upscayl", label: "Upscayl", icon: SearchPlusIcon },
  { key: "batch-upscayl", label: "Batch Upscayl", icon: FoldersIcon },
  { key: "remove-background", label: "Background Remove", icon: EraserIcon },
] as const satisfies readonly {
  key: HistoryEntryKind | "all";
  label: string;
  icon: AnimatedIcon;
}[];

const SORTING = [
  { key: "newest", label: "Newest first", icon: ArrowDownWideNarrowIcon },
  { key: "oldest", label: "Oldest first", icon: ArrowUpNarrowWideIcon },
] as const satisfies readonly {
  key: string;
  label: string;
  icon: AnimatedIcon;
}[];

type Filter = (typeof FILTERS)[number]["key"];
type Sorting = (typeof SORTING)[number]["key"];

const History = () => {
  const [showClearDialog, setShowClearDialog] = useState(false);
  const t = useTranslation();
  const load = useSetAtom(loadHistoryItems);
  // One hover handle per tab. Hook order stays fixed: the keys never change.
  const filterHovers: Record<Filter, ReturnType<typeof useIconHover>> = {
    all: useIconHover(),
    upscayl: useIconHover(),
    "batch-upscayl": useIconHover(),
    "remove-background": useIconHover(),
  };
  const sortHovers: Record<Sorting, ReturnType<typeof useIconHover>> = {
    newest: useIconHover(),
    oldest: useIconHover(),
  };
  const clearHover = useIconHover();
  const [selectedFilter, setSelectedFilter] = useState<Filter>("all");
  const [selectedSorting, setSelectedSorting] = useState<Sorting>("newest");

  const items = useAtomValue(historyAtom).filter(
    (item) => item.kind && item.outputPath,
  );

  const entries = useMemo((): HistoryGroup[] => {
    const batches: Record<string, HistoryItem[]> = {};
    const singles: HistoryItem[] = [];

    for (const item of items) {
      if (item.settings.entryKind === "batch-upscayl") {
        (batches[item.batchId] ??= []).push(item);
      } else {
        singles.push(item);
      }
    }

    let historyItems = [
      ...Object.entries(batches).map(([batchId, items]) =>
        toGroup("batch", batchId, items),
      ),
      ...(singles.map((item) =>
        toGroup("single", item.id.toString(), [item]),
      ) as HistoryGroup[]),
    ];

    if (selectedFilter !== "all") {
      historyItems = historyItems.map((item) =>
        item.type === "batch" && selectedFilter !== "remove-background"
          ? item
          : {
              ...item,
              items: item.items.filter(
                (i) => i.settings.entryKind === selectedFilter,
              ),
            },
      );
    }

    return historyItems
      .filter((item) => item.items.length !== 0)
      .sort((a, b) =>
        selectedSorting === "newest"
          ? b.createdAt - a.createdAt
          : a.createdAt - b.createdAt,
      );
  }, [items, selectedFilter, selectedSorting]);

  useEffect(() => {
    load();
  }, []);

  return (
    <section className="flex size-full min-h-0 flex-col overflow-y-auto rounded-4xl border bg-secondary glass-panel">
      <header className="pt inline-flex items-center justify-between gap-3 p-5 pb-0">
        <div className="inline-flex gap-0.5 rounded-full border border-border/50 bg-card p-1">
          {FILTERS.map((filter) => {
            const isActive = filter.key === selectedFilter;

            return (
              <Tooltip key={filter.key}>
                <TooltipTrigger>
                  <Button
                    {...filterHovers[filter.key].hoverProps}
                    role="tab"
                    aria-selected={isActive}
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedFilter(filter.key)}
                    className={cn(
                      "relative isolate rounded-full px-4 transition-colors duration-200 hover:bg-transparent!",
                      isActive
                        ? "text-secondary-foreground hover:text-secondary-foreground"
                        : "text-muted-foreground hover:text-muted-foreground",
                    )}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="filter-active-tab-highlight"
                        className="absolute inset-0 -z-10 rounded-full bg-muted"
                        transition={{
                          type: "spring",
                          stiffness: 500,
                          damping: 40,
                        }}
                      />
                    )}
                    <filter.icon
                      ref={filterHovers[filter.key].ref}
                      className="size-4"
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{filter.label}</TooltipContent>
              </Tooltip>
            );
          })}
        </div>
        <div className="inline-flex gap-2">
          <div className="inline-flex gap-1 rounded-full bg-background p-1">
            {SORTING.map((sort) => {
              const isActive = sort.key === selectedSorting;

              return (
                <Tooltip key={sort.key}>
                  <TooltipTrigger>
                    <Button
                      {...sortHovers[sort.key].hoverProps}
                      role="tab"
                      aria-selected={isActive}
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedSorting(sort.key)}
                      className={cn(
                        "relative isolate rounded-full px-4 transition-colors duration-200 hover:bg-transparent!",
                        isActive
                          ? "text-secondary-foreground hover:text-secondary-foreground"
                          : "text-muted-foreground hover:text-muted-foreground",
                      )}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="sorting-active-tab-highlight"
                          className="absolute inset-0 -z-10 rounded-full bg-muted"
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 40,
                          }}
                        />
                      )}
                      <sort.icon
                        ref={sortHovers[sort.key].ref}
                        className="size-4"
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{sort.label}</TooltipContent>
                </Tooltip>
              );
            })}
          </div>
          {items.length > 0 && (
            <div className="rounded-full bg-background p-1">
              <Tooltip>
                <TooltipTrigger>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowClearDialog(true)}
                    {...clearHover.hoverProps}
                  >
                    <Trash2Icon ref={clearHover.ref} className="size-4" />
                    <span className="sr-only">{t("Clear all")}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{t("Clear all")}</TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
        {entries.length === 0 ? (
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
            {entries.map((entry) => (
              <HistoryCard key={entry.key} items={entry.items} />
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
