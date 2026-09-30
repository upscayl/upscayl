import { CheckIcon, FolderOpenIcon } from "lucide-react";

import useTranslation from "@/components/hooks/use-translation";

const batchPreviewImages = [
  "./model-comparison/upscayl-standard-4x/after.webp",
  "./model-comparison/digital-art-4x/after.webp",
  "./model-comparison/high-fidelity-4x/after.webp",
  "./model-comparison/ultrasharp-4x/after.webp",
];

export default function BatchVisual() {
  const t = useTranslation();

  return (
    <div className="flex size-full flex-col justify-between gap-3 rounded-xl bg-muted p-3">
      <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
        <span>{t("Project folder")}</span>
        <FolderOpenIcon className="size-3.5" />
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {batchPreviewImages.map((src) => (
          <div
            key={src}
            className="relative aspect-square overflow-hidden rounded-lg ring-1 ring-foreground/10"
          >
            <img src={src} alt="" className="size-full object-cover" />
            <span className="absolute right-1 bottom-1 flex size-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <CheckIcon className="size-2.5" strokeWidth={3} />
            </span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground tabular-nums">
        <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-foreground/10">
          <span className="block h-full w-3/4 rounded-full bg-primary" />
        </span>
        12 / 16
      </div>
    </div>
  );
}
