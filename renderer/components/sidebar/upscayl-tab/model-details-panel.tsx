import { Maximize2 } from "lucide-react";
import useTranslation from "@/components/hooks/use-translation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ModelDetailsPanelProps } from "@/types/model-selection";
import ModelImageComparison from "./model-image-comparison";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const ModelDetailsPanel = ({
  modelId,
  modelName,
  modelDescription,
  previewPaths,
  hasPreview,
  isBeforePreviewUnavailable,
  isAfterPreviewUnavailable,
  onPreviewUnavailable,
  onZoom,
}: ModelDetailsPanelProps) => {
  const t = useTranslation();
  const isBuiltInModel = modelId !== null && previewPaths !== null;

  return (
    <ScrollArea className="min-h-0 overflow-y-auto rounded-[1.35rem] bg-background/70 p-2">
      <div className="flex min-h-full flex-col gap-4 pb-1">
        <div className="rounded-[1.35rem] bg-secondary p-4">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold tracking-tight">
                {modelName}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {isBuiltInModel
                  ? "Bundled Upscayl model"
                  : "Imported custom model"}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {hasPreview && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  className="rounded-full"
                  onClick={() => onZoom(modelId)}
                >
                  <Maximize2 className="size-4" />
                  <span className="sr-only">{t("Zoom")}</span>
                </Button>
              )}
              <Badge className="rounded-full">Selected</Badge>
            </div>
          </div>
          {isBuiltInModel ? (
            <div className="space-y-4">
              <ModelImageComparison
                beforeSrc={previewPaths.before}
                afterSrc={previewPaths.after}
                beforeAlt={`${modelName} ${t("Before")}`}
                afterAlt={`${modelName} ${t("After")}`}
                beforeLabel={t("Before")}
                afterLabel={t("After")}
                isBeforeUnavailable={isBeforePreviewUnavailable}
                isAfterUnavailable={isAfterPreviewUnavailable}
                className="aspect-[4/3] min-h-0 rounded-[1.2rem] bg-card ring-1 ring-border/80"
                onPreviewUnavailable={onPreviewUnavailable}
              />
              <div className="rounded-[1.2rem] bg-card/60 p-4 ring-1 ring-border/70">
                <dl className="space-y-3 text-sm">
                  <div className="flex items-start justify-between gap-4 border-b pb-3">
                    <dt className="text-muted-foreground">Recommended for</dt>
                    <dd className="max-w-[13rem] min-w-0 text-right leading-relaxed break-words whitespace-normal">
                      {modelDescription}
                    </dd>
                  </div>
                  <div className="flex items-start justify-between gap-4 border-b pb-3">
                    <dt className="text-muted-foreground">Model type</dt>
                    <dd className="max-w-[13rem] min-w-0 text-right leading-relaxed break-words whitespace-normal">
                      Built-in model
                    </dd>
                  </div>
                  <div className="flex items-start justify-between gap-4 border-b pb-3">
                    <dt className="text-muted-foreground">Scale support</dt>
                    <dd className="max-w-[13rem] min-w-0 text-right leading-relaxed break-words whitespace-normal">
                      4x
                    </dd>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <dt className="text-muted-foreground">Preview</dt>
                    <dd className="max-w-[13rem] min-w-0 text-right leading-relaxed break-words whitespace-normal">
                      {hasPreview
                        ? "Bundled before and after comparison"
                        : "Comparison preview unavailable"}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          ) : (
            <div className="rounded-[1.2rem] bg-card/60 p-4 ring-1 ring-border/70">
              <dl className="space-y-3 text-sm">
                <div className="flex items-start justify-between gap-4 border-b pb-3">
                  <dt className="text-muted-foreground">Model type</dt>
                  <dd className="max-w-[13rem] min-w-0 text-right leading-relaxed break-words whitespace-normal">
                    Custom model
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4 border-b pb-3">
                  <dt className="text-muted-foreground">Preview</dt>
                  <dd className="max-w-[13rem] min-w-0 text-right leading-relaxed break-words whitespace-normal">
                    No bundled preview
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-4">
                  <dt className="text-muted-foreground">Selection</dt>
                  <dd className="max-w-[13rem] min-w-0 text-right leading-relaxed break-words whitespace-normal">
                    Imported models use the filename shown in the list.
                  </dd>
                </div>
              </dl>
            </div>
          )}
        </div>
        <div className="rounded-[1.35rem] bg-secondary p-4">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {modelDescription}
          </p>
        </div>
      </div>
      <ScrollBar orientation="vertical" />
    </ScrollArea>
  );
};

export default ModelDetailsPanel;
