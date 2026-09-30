import { useState } from "react";
import { ChevronsLeftRightIcon, SparklesIcon } from "lucide-react";

import useTranslation from "@/components/hooks/use-translation";
import OverlayChip from "@/components/onboarding/shared/overlay-chip";
import { cn } from "@/lib/utils";
import { MODELS } from "@common/models-list";

export default function ComparePreview() {
  const t = useTranslation();
  const { id, name } = MODELS["upscayl-standard-4x"];
  const [position, setPosition] = useState<number | null>(null);
  const divider = position ?? 50;

  return (
    <div className="w-full max-w-[540px] sm:justify-self-end">
      <div
        onPointerMove={(event) => {
          if (event.pointerType !== "mouse") return;
          const { left, width } = event.currentTarget.getBoundingClientRect();
          setPosition(((event.clientX - left) / width) * 100);
        }}
        className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-muted shadow-2xl ring-1 shadow-foreground/10 ring-foreground/10 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring"
      >
        <img
          src={`./model-comparison/${id}/after.webp`}
          alt=""
          draggable={false}
          className="absolute inset-0 size-full object-cover"
        />
        <img
          src={`./model-comparison/${id}/before.webp`}
          alt=""
          draggable={false}
          className="absolute inset-0 size-full object-cover"
          style={{ clipPath: `inset(0 ${100 - divider}% 0 0)` }}
        />

        <div
          className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-white shadow-[0_0_12px_rgba(0,0,0,0.35)]"
          style={{ left: `${divider}%` }}
        >
          <span className="absolute top-1/2 left-1/2 flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-neutral-900 shadow-lg">
            <ChevronsLeftRightIcon className="size-4" />
          </span>
        </div>

        <OverlayChip
          className={cn("bottom-3 left-3", divider < 16 && "opacity-0")}
        >
          {t("Original")}
        </OverlayChip>
        <OverlayChip
          className={cn("right-3 bottom-3", divider > 84 && "opacity-0")}
        >
          <SparklesIcon className="size-3" />
          {t("Upscayled")}
        </OverlayChip>
        <OverlayChip className="top-3 right-3">{name} · 4×</OverlayChip>
        <OverlayChip
          className={cn("top-3 left-3", position !== null && "opacity-0")}
        >
          <ChevronsLeftRightIcon className="size-3" />
          {t("Go on, hover over it")}
        </OverlayChip>

        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={divider}
          onChange={(event) => setPosition(Number(event.target.value))}
          aria-label={t("Compare original and upscaled")}
          className="absolute inset-0 size-full cursor-ew-resize opacity-0"
        />
      </div>

      <dl className="mt-3 grid grid-cols-3 divide-x divide-border rounded-2xl bg-card ring-1 ring-foreground/10">
        {[
          [t("Original"), "200 px"],
          [t("Upscaled"), "800 px"],
          [t("Scale"), "4×"],
        ].map(([label, value]) => (
          <div key={label} className="px-4 py-2.5">
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="mt-0.5 text-sm font-medium tabular-nums">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
