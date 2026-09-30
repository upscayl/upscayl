import useTranslation from "@/components/hooks/use-translation";
import OverlayChip from "@/components/onboarding/shared/overlay-chip";
import { MODELS } from "@common/models-list";

export default function RemoveBgVisual() {
  const t = useTranslation();
  const { id } = MODELS["upscayl-standard-4x"];

  return (
    <div className="relative flex size-full items-center justify-center overflow-hidden rounded-xl bg-muted [background-image:repeating-conic-gradient(color-mix(in_oklch,var(--foreground)_8%,transparent)_0%_25%,transparent_0%_50%)] [background-size:16px_16px]">
      <img
        src={`./model-comparison/${id}/after.webp`}
        alt=""
        className="-mt-8 size-16 rounded-full object-cover shadow-xl ring-4 ring-background lg:size-20"
      />
      <OverlayChip className="bottom-2.5 left-2.5">
        {t("Transparent background")}
      </OverlayChip>
    </div>
  );
}
