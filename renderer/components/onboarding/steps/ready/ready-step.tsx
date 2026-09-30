import {
  ArrowRightIcon,
  CheckIcon,
  FileImageIcon,
  WandSparklesIcon,
} from "lucide-react";

import useTranslation from "@/components/hooks/use-translation";
import Eyebrow from "@/components/onboarding/shared/eyebrow";
import IconTile from "@/components/onboarding/shared/icon-tile";
import { Card, CardContent } from "@/components/ui/card";

export default function ReadyStep() {
  const t = useTranslation();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-8 shadow-foreground/10 ring-foreground/5">
        <CheckIcon className="size-6" strokeWidth={2.5} />
      </span>
      <div className="mt-5">
        <Eyebrow>{t("Ready? You better be!")}</Eyebrow>
      </div>
      <h2
        data-step-heading
        tabIndex={-1}
        className="mt-3 text-3xl font-semibold tracking-tight text-balance outline-none sm:text-4xl lg:text-5xl"
      >
        {t("Let's-a-go, Mario!")}
      </h2>
      <p className="mt-2 text-xs text-muted-foreground">
        {t("(No copyright intended, please don't sue us Nintendo™ 😭)")}
      </p>
      <p className="mt-4 max-w-xl text-base leading-6 text-pretty text-muted-foreground">
        {t(
          "Start with the worst photo you own. We don't like it sitting there, rotting.",
        )}
      </p>

      <div className="mt-6 grid w-full gap-3 text-left sm:grid-cols-3">
        {[
          {
            icon: FileImageIcon,
            label: t("Grab the blurry mess"),
            detail: t("PNG, JPG, or WEBP"),
          },
          {
            icon: WandSparklesIcon,
            label: t("Pick a model"),
            detail: t(
              "Not sure what to pick? Just keep it at default. It's all good g.",
            ),
          },
          {
            icon: ArrowRightIcon,
            label: t("Hit Upscayl"),
            detail: t(
              "Yeah, we named our button after the app. Got a problem, hermano?",
            ),
          },
        ].map(({ icon, label, detail }, index) => (
          <Card key={label} className="gap-0 py-0 shadow-sm">
            <CardContent className="p-3.5">
              <div className="flex items-center justify-between">
                <IconTile icon={icon} />
                <span className="text-xs font-medium text-muted-foreground tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <p className="mt-3 text-sm font-medium">{label}</p>
              <p className="mt-1 text-xs leading-5 text-pretty text-muted-foreground">
                {detail}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
