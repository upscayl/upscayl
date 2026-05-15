"use client";

import React, { useState } from "react";
import { Maximize2, SwatchBookIcon, X } from "lucide-react";
import { ModelId, MODELS } from "@common/models-list";
import { useAtom, useAtomValue } from "jotai";
import { selectedModelIdAtom } from "@/atoms/user-settings-atom";
import { customModelIdsAtom } from "@/atoms/models-list-atom";
import useTranslation from "@/components/hooks/use-translation";
import posthog from "posthog-js";

const SelectModelDialog = () => {
  const t = useTranslation();
  const [selectedModelId, setSelectedModelId] = useAtom(selectedModelIdAtom);

  const customModelIds = useAtomValue(customModelIdsAtom);
  const [open, setOpen] = useState(false);
  const [zoomedModel, setZoomedModel] = useState<ModelId | null>(null);

  const handleModelSelect = (model: ModelId | string) => {
    setSelectedModelId(model);
    setOpen(false);

    posthog.capture("model_selected", {
      $ip: "0.0.0.0",
      $geoip_disable: true,
      model,
    });
  };

  const handleZoom = (event: React.MouseEvent, model: ModelId) => {
    event.stopPropagation();
    setZoomedModel(model);
  };

  return (
    <div className="flex flex-col gap-4">
      <button
        className="btn btn-primary border-border justify-start"
        onClick={() => setOpen(true)}
      >
        <SwatchBookIcon className="mr-2 h-5 w-5" />
        {selectedModelId in MODELS
          ? t(
              `APP.MODEL_SELECTION.MODELS.${MODELS[selectedModelId]?.id}.NAME` as any,
            )
          : selectedModelId}
      </button>

      {open && (
        <div className="modal modal-open z-50">
          <div className="modal-box max-w-lg">
            <div className="mb-4 flex items-start justify-between gap-4">
              <h3 className="text-lg font-semibold">
                {t("APP.MODEL_SELECTION.DESCRIPTION")}
              </h3>
              <button
                className="btn btn-circle btn-ghost btn-sm"
                onClick={() => setOpen(false)}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </button>
            </div>
            <div className="max-h-[600px] overflow-y-auto pr-4">
              <div className="flex flex-col gap-4">
                {Object.entries(MODELS).map((modelData) => {
                  const modelId = modelData[0] as ModelId;
                  const model = modelData[1];
                  return (
                    <button
                      key={modelId}
                      className="btn rounded-box border-base-content/10 bg-base-100 h-auto w-full flex-col items-start p-4 text-left shadow-sm"
                      onClick={() => handleModelSelect(modelId)}
                    >
                      <p className="font-semibold">
                        {t(`APP.MODEL_SELECTION.MODELS.${modelId}.NAME`)}
                      </p>
                      <p className="text-base-content/70 mb-2 text-left leading-normal font-normal">
                        {t(`APP.MODEL_SELECTION.MODELS.${modelId}.DESCRIPTION`)}
                      </p>
                      <div className="rounded-box relative h-52 w-full overflow-hidden">
                        <div className="flex h-full w-full">
                          <img
                            src={`public:///model-comparison/${model.id}/before.webp`}
                            alt={`Model Before`}
                            className="h-full w-1/2 object-cover"
                          />
                          <img
                            src={`public:///model-comparison/${model.id}/after.webp`}
                            alt={`Model After`}
                            className="h-full w-1/2 object-cover"
                          />
                        </div>
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                          <div className="h-full w-px bg-white opacity-50"></div>
                        </div>
                        <div className="bg-opacity-50 absolute bottom-2 left-2 rounded bg-black px-1 text-xs text-white">
                          {t("APP.MODEL_SELECTION.BEFORE")}
                        </div>
                        <div className="bg-opacity-50 absolute right-2 bottom-2 rounded bg-black px-1 text-xs text-white">
                          {t("APP.MODEL_SELECTION.AFTER")}
                        </div>
                        <button
                          className="btn btn-circle btn-secondary btn-sm absolute top-2 right-2"
                          onClick={(e) => handleZoom(e, modelId)}
                        >
                          <Maximize2 className="h-4 w-4" />
                          <span className="sr-only">
                            {t("APP.MODEL_SELECTION.ZOOM")}
                          </span>
                        </button>
                      </div>
                    </button>
                  );
                })}
                {customModelIds.length > 0 && (
                  <p className="text-base-content font-semibold">
                    {t("APP.MODEL_SELECTION.IMPORTED_CUSTOM_MODELS")}
                  </p>
                )}
                {customModelIds.map((customModel) => {
                  return (
                    <button
                      key={customModel}
                      className="btn rounded-box bg-base-100 h-auto w-full items-start p-4 text-left shadow-sm"
                      onClick={() => handleModelSelect(customModel)}
                    >
                      {customModel}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <button className="modal-backdrop" onClick={() => setOpen(false)}>
            Close
          </button>
        </div>
      )}

      {!!zoomedModel && (
        <div className="modal modal-open z-[60]">
          <div className="modal-box h-screen max-w-full rounded-none bg-black p-0">
            <div className="relative flex h-full w-full items-center justify-center bg-black">
              <div className="flex h-full w-full">
                <div className="relative h-full w-1/2">
                  <img
                    src={`public:///model-comparison/${MODELS[zoomedModel]?.id}/before.webp`}
                    alt={`Zoomed in Image - Before`}
                    className="h-full w-full object-contain"
                  />
                  <div className="bg-opacity-50 absolute bottom-4 left-4 rounded bg-black px-2 py-1 text-sm text-white">
                    Before
                  </div>
                </div>
                <div className="relative h-full w-1/2">
                  <img
                    src={`public:///model-comparison/${MODELS[zoomedModel]?.id}/after.webp`}
                    alt={`Zoomed in Image - After`}
                    className="h-full w-full object-contain"
                  />
                  <div className="bg-opacity-50 absolute right-4 bottom-4 rounded bg-black px-2 py-1 text-sm text-white">
                    After
                  </div>
                </div>
              </div>
              <button
                className="btn btn-circle btn-secondary absolute top-4 right-4"
                onClick={() => setZoomedModel(null)}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </button>
            </div>
          </div>
          <button
            className="modal-backdrop"
            onClick={() => setZoomedModel(null)}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default SelectModelDialog;
