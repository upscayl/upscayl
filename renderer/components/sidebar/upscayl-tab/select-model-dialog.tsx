"use client";

import { useState } from "react";
import { ChevronDownIcon, XIcon } from "lucide-react";
import { MODELS } from "@common/models-list";
import type { ModelId } from "@common/models-list";
import { useAtom, useAtomValue } from "jotai";
import { selectedModelIdAtom } from "@/atoms/user-settings-atom";
import { customModelIdsAtom } from "@/atoms/models-list-atom";
import useTranslation from "@/components/hooks/use-translation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getModelPreviewPaths, isBuiltInModelId } from "@/lib/model-selection";
import posthog from "posthog-js";
import ModelDetailsPanel from "./model-details-panel";
import ModelPreviewDialog from "./model-preview-dialog";
import ModelSelectionPanel from "./model-selection-panel";
import type { ModelFilter, ModelOption } from "@/types/model-selection";

const SelectModelDialog = () => {
  const t = useTranslation();
  const [selectedModelId, setSelectedModelId] = useAtom(selectedModelIdAtom);
  const customModelIds = useAtomValue(customModelIdsAtom);
  const [open, setOpen] = useState(false);
  const [draftModelId, setDraftModelId] = useState(selectedModelId);
  const [zoomedModelId, setZoomedModelId] = useState<ModelId | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [modelFilter, setModelFilter] = useState<ModelFilter>("all");
  const [brokenPreviewPaths, setBrokenPreviewPaths] = useState<string[]>([]);

  const setModelDialogOpen = (isOpen: boolean) => {
    if (isOpen) {
      setDraftModelId(selectedModelId);
      setSearchQuery("");
      setModelFilter("all");
    }

    setOpen(isOpen);
  };

  const selectModel = (modelId: string) => {
    setSelectedModelId(modelId);
    setOpen(false);

    posthog.capture("model_selected", {
      $ip: "0.0.0.0",
      $geoip_disable: true,
      model: modelId,
    });
  };

  const markPreviewUnavailable = (path: string) => {
    setBrokenPreviewPaths((paths) =>
      paths.includes(path) ? paths : [...paths, path],
    );
  };

  const selectedBuiltInModelId = isBuiltInModelId(draftModelId)
    ? draftModelId
    : null;
  const currentBuiltInModelId = isBuiltInModelId(selectedModelId)
    ? selectedModelId
    : null;
  const previewPaths = selectedBuiltInModelId
    ? getModelPreviewPaths(selectedBuiltInModelId)
    : null;
  const isBeforePreviewUnavailable =
    previewPaths !== null && brokenPreviewPaths.includes(previewPaths.before);
  const isAfterPreviewUnavailable =
    previewPaths !== null && brokenPreviewPaths.includes(previewPaths.after);
  const hasPreview =
    previewPaths !== null &&
    !isBeforePreviewUnavailable &&
    !isAfterPreviewUnavailable;
  const selectedModelName = selectedBuiltInModelId
    ? t(MODELS[selectedBuiltInModelId].name)
    : draftModelId;
  const selectedModelDescription = selectedBuiltInModelId
    ? t(MODELS[selectedBuiltInModelId].description)
    : "Imported custom model";
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const visibleModels: ModelOption[] = [
    ...(Object.keys(MODELS) as ModelId[]).map((modelId) => ({
      id: modelId,
      name: t(MODELS[modelId].name),
      description: t(MODELS[modelId].description),
      kind: "built-in" as const,
      afterPreviewSrc: getModelPreviewPaths(modelId).after,
    })),
    ...customModelIds.map((modelId) => ({
      id: modelId,
      name: modelId,
      description: "Imported custom model",
      kind: "custom" as const,
    })),
  ].filter((model) => {
    const matchesFilter = modelFilter === "all" || model.kind === modelFilter;
    const matchesSearch =
      !normalizedSearchQuery ||
      model.name.toLowerCase().includes(normalizedSearchQuery) ||
      model.description.toLowerCase().includes(normalizedSearchQuery);

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex flex-col gap-4">
      <Button
        variant="secondary"
        className="h-auto min-h-12 min-w-0 justify-start rounded-xl bg-card px-3 py-2.5 text-left whitespace-normal shadow-sm hover:border-foreground/20 hover:bg-muted/50"
        size="lg"
        onClick={() => setModelDialogOpen(true)}
      >
        <span className="flex min-w-0 flex-1 flex-col gap-0.5 whitespace-normal">
          <span className="font-semibold wrap-break-word">
            {currentBuiltInModelId
              ? t(MODELS[currentBuiltInModelId].name)
              : selectedModelId}
          </span>
          {currentBuiltInModelId && (
            <span className="text-xs leading-snug font-normal wrap-break-word text-muted-foreground">
              {t(MODELS[currentBuiltInModelId].description)}
            </span>
          )}
        </span>
        <ChevronDownIcon className="ml-auto size-4 text-muted-foreground" />
      </Button>

      <Dialog open={open} onOpenChange={setModelDialogOpen}>
        <DialogContent
          showCloseButton={false}
          className="h-[44rem] max-h-[calc(100dvh-2rem)] w-[96%] grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden border bg-popover p-0 shadow-xl sm:max-w-5xl"
        >
          <DialogHeader className="border-b bg-muted/30 px-5 py-5 sm:px-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <DialogTitle className="text-xl font-semibold tracking-tight">
                  {t("Select AI Model")}
                </DialogTitle>
                <DialogDescription className="text-sm">
                  Choose the best model for your image
                </DialogDescription>
              </div>
              <DialogClose asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full text-muted-foreground"
                >
                  <XIcon className="size-4" />
                  <span className="sr-only">Close</span>
                </Button>
              </DialogClose>
            </div>
          </DialogHeader>
          <div className="min-h-0 flex-1 p-4 sm:p-5">
            <div className="grid h-full min-h-0 gap-3 rounded-[1.5rem] bg-secondary p-2 min-[700px]:grid-cols-[minmax(0,1.05fr)_minmax(18rem,0.95fr)] min-[700px]:border min-[700px]:border-border/10">
              <ModelSelectionPanel
                searchQuery={searchQuery}
                modelFilter={modelFilter}
                customModelCount={customModelIds.length}
                selectedModelId={draftModelId}
                visibleModels={visibleModels}
                onSearchQueryChange={setSearchQuery}
                onModelFilterChange={setModelFilter}
                onModelSelect={setDraftModelId}
              />
              <ModelDetailsPanel
                modelId={selectedBuiltInModelId}
                modelName={selectedModelName}
                modelDescription={selectedModelDescription}
                previewPaths={previewPaths}
                hasPreview={hasPreview}
                isBeforePreviewUnavailable={isBeforePreviewUnavailable}
                isAfterPreviewUnavailable={isAfterPreviewUnavailable}
                onPreviewUnavailable={markPreviewUnavailable}
                onZoom={setZoomedModelId}
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 border-t bg-muted/30 px-5 py-4 sm:px-6">
            <DialogClose asChild>
              <Button variant="outline" className="min-w-28 rounded-full">
                Cancel
              </Button>
            </DialogClose>
            <Button
              className="min-w-32 rounded-full"
              onClick={() => selectModel(draftModelId)}
            >
              Use Model
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ModelPreviewDialog
        modelId={zoomedModelId}
        previewPaths={previewPaths}
        isBeforePreviewUnavailable={isBeforePreviewUnavailable}
        isAfterPreviewUnavailable={isAfterPreviewUnavailable}
        onPreviewUnavailable={markPreviewUnavailable}
        onClose={() => setZoomedModelId(null)}
      />
    </div>
  );
};

export default SelectModelDialog;
