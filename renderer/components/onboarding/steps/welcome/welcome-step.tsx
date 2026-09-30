import { HeartIcon, MonitorIcon, SparklesIcon } from "lucide-react";

import useTranslation from "@/components/hooks/use-translation";
import Eyebrow from "@/components/onboarding/shared/eyebrow";

import ComparePreview from "./compare-preview";

export default function WelcomeStep() {
  const t = useTranslation();

  return (
    <div className="mx-auto grid w-full max-w-6xl items-center gap-10 sm:grid-cols-2 lg:gap-16">
      <section>
        <Eyebrow>{t("Welcome to Upscayl")}</Eyebrow>
        <h1
          data-step-heading
          tabIndex={-1}
          className="mt-4 text-4xl leading-[1.05] font-semibold tracking-tight text-balance outline-none sm:text-5xl lg:text-6xl"
        >
          {t("From Science Fiction")}{" "}
          <span className="text-foreground/40">{t("to Reality")}</span>
        </h1>
        <p className="mt-5 max-w-md text-base leading-7 text-pretty text-muted-foreground">
          {t(
            "Give your low quality photos the comeback they deserve. We're so back!",
          )}
        </p>
        <ul className="mt-7 flex flex-col gap-2.5 text-sm text-muted-foreground">
          {[
            { icon: MonitorIcon, label: t("Runs locally on your device.") },
            { icon: SparklesIcon, label: t("Quality that you always craved.") },
            {
              icon: HeartIcon,
              label: t("Free and Open Source, just for you my g ❤️"),
            },
          ].map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-2">
              <Icon className="size-4 text-foreground" />
              {label}
            </li>
          ))}
        </ul>
      </section>

      <ComparePreview />
    </div>
  );
}
