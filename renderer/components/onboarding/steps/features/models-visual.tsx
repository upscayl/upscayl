import { CheckIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { MODELS } from "@common/models-list";

const modelPreviewIds = [
  "upscayl-standard-4x",
  "digital-art-4x",
  "high-fidelity-4x",
] as const;

export default function ModelsVisual() {
  return (
    <div className="flex size-full flex-col justify-center gap-1 rounded-xl bg-muted p-2">
      {modelPreviewIds.map((id, index) => (
        <div
          key={id}
          className={cn(
            "flex items-center gap-2 rounded-lg p-1 pr-2.5 ring-1",
            index === 0
              ? "bg-background shadow-sm ring-foreground/25"
              : "bg-background/50 ring-foreground/5",
          )}
        >
          <img
            src={`./model-comparison/${id}/after.webp`}
            alt=""
            className="size-6 shrink-0 rounded-md object-cover"
          />
          <span className="flex-1 truncate text-xs font-medium">
            {MODELS[id].name}
          </span>
          {index === 0 && <CheckIcon className="size-3.5 shrink-0" />}
        </div>
      ))}
    </div>
  );
}
