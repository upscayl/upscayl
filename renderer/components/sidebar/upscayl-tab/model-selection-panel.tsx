import { SearchIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type {
  ModelFilter,
  ModelSelectionPanelProps,
} from "@/types/model-selection";

const ModelSelectionPanel = ({
  searchQuery,
  modelFilter,
  customModelCount,
  selectedModelId,
  visibleModels,
  onSearchQueryChange,
  onModelFilterChange,
  onModelSelect,
}: ModelSelectionPanelProps) => {
  return (
    <div className="flex min-h-0 flex-col rounded-[1.35rem] bg-background/70 p-4 sm:p-5">
      <div className="flex flex-col gap-3 border-b pb-3 sm:flex-row">
        <div className="relative w-full flex-1 sm:max-w-2/4 lg:max-w-full">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(event) => onSearchQueryChange(event.target.value)}
            placeholder="Search models..."
            className="h-9 rounded-full bg-secondary pr-4 pl-10"
          />
        </div>
        <Select
          value={modelFilter}
          onValueChange={(value) => onModelFilterChange(value as ModelFilter)}
        >
          <SelectTrigger className="ml-auto h-11 w-full rounded-full bg-secondary sm:w-[9rem]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All models</SelectItem>
            <SelectItem value="built-in">Built-in models</SelectItem>
            <SelectItem value="custom">Custom models</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="mt-3 flex items-center justify-between px-1 text-xs text-muted-foreground">
        <span>
          {visibleModels.length} model
          {visibleModels.length === 1 ? "" : "s"}
        </span>
        {customModelCount > 0 && (
          <span>{customModelCount} custom imported</span>
        )}
      </div>
      <div className="mt-3 min-h-0 flex-1 overflow-y-auto p-2 pr-1">
        {visibleModels.length > 0 ? (
          <div className="space-y-2">
            {visibleModels.map((model) => {
              const isSelected = selectedModelId === model.id;

              return (
                <button
                  type="button"
                  id={model.id}
                  key={model.id}
                  onClick={() => onModelSelect(model.id)}
                  aria-pressed={isSelected}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-2xl bg-secondary p-2 py-1.5 pr-4 text-left transition-all hover:bg-muted/40 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                    isSelected && "bg-muted/55 ring-1 ring-foreground/12",
                  )}
                >
                  {model.afterPreviewSrc && (
                    <img
                      src={model.afterPreviewSrc}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="size-11 shrink-0 rounded-xl object-cover"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-base font-semibold tracking-tight">
                          {model.name}
                        </p>
                        <p className="mt-1 line-clamp-1 text-sm leading-relaxed text-muted-foreground">
                          {model.description}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className="shrink-0 rounded-full"
                      >
                        {model.kind === "built-in" ? "Built-in" : "Custom"}
                      </Badge>
                    </div>
                  </div>
                  <span
                    className="flex size-5 shrink-0 items-center justify-center rounded-full border border-muted-foreground/60"
                    aria-hidden="true"
                  >
                    {isSelected && (
                      <span className="size-2.5 rounded-full bg-foreground" />
                    )}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="ring-dashed flex h-full min-h-40 items-center justify-center rounded-[1.35rem] bg-background/20 p-6 text-center text-sm text-muted-foreground ring-1 ring-border/70">
            No models match your search.
          </div>
        )}
      </div>
    </div>
  );
};

export default ModelSelectionPanel;
