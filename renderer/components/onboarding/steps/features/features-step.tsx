import { EraserIcon, Layers3Icon, WandSparklesIcon } from "lucide-react";

import useTranslation from "@/components/hooks/use-translation";
import Eyebrow from "@/components/onboarding/shared/eyebrow";
import IconTile from "@/components/onboarding/shared/icon-tile";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";

import BatchVisual from "./batch-visual";
import ModelsVisual from "./models-visual";
import RemoveBgVisual from "./remove-bg-visual";

const featureCards = [
  {
    title: "Models for every style",
    description:
      "Got a digital painting? Vacation photos? Low-quality logos? Bring them on!",
    icon: WandSparklesIcon,
    Visual: ModelsVisual,
  },
  {
    title: "One Sheep. Two Sheep. Three Sheep...",
    description: "All your photos, processed in one single go 😎",
    icon: Layers3Icon,
    Visual: BatchVisual,
  },
  {
    title: "Don't like the background?",
    description: "Me neither. There, removed it for you!",
    icon: EraserIcon,
    Visual: RemoveBgVisual,
  },
];

export default function FeaturesStep() {
  const t = useTranslation();

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="mx-auto max-w-2xl text-center">
        <Eyebrow>{t("See what we offer")}</Eyebrow>
        <h2
          data-step-heading
          tabIndex={-1}
          className="mt-3 text-3xl font-semibold tracking-tight text-balance outline-none sm:text-4xl"
        >
          {t("I've got something to show you!")}
        </h2>
        <p className="mt-2 text-base leading-6 text-pretty text-muted-foreground">
          {t(
            "Upscale your images, remove backgrounds and more, with several models, options and settings.",
          )}
        </p>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        {featureCards.map(({ title, description, icon, Visual }) => (
          <Card key={title} className="h-full gap-0 py-0 shadow-sm">
            <CardContent className="flex h-full flex-col p-2">
              <div className="h-32 shrink-0 lg:h-44">
                <Visual />
              </div>
              <div className="flex flex-1 flex-col gap-2 px-3 pt-3 pb-3">
                <div className="flex items-center gap-2.5">
                  <IconTile icon={icon} />
                  <CardTitle className="text-base">{t(title)}</CardTitle>
                </div>
                <CardDescription className="leading-5 text-pretty">
                  {t(description)}
                </CardDescription>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
