import { useAtom } from "jotai";
import { LockIcon } from "lucide-react";

import {
  autoUpdateAtom,
  enableContributionAtom,
} from "@/atoms/user-settings-atom";
import useTranslation from "@/components/hooks/use-translation";
import Eyebrow from "@/components/onboarding/shared/eyebrow";
import LanguageSwitcher from "@/components/sidebar/settings-tab/language-switcher";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

import AppearanceToggle from "./appearance-toggle";
import SettingRow from "./setting-row";

export default function PreferencesStep() {
  const t = useTranslation();
  const [autoUpdate, setAutoUpdate] = useAtom(autoUpdateAtom);
  const [enableContribution, setEnableContribution] = useAtom(
    enableContributionAtom,
  );

  return (
    <div className="mx-auto grid w-full max-w-5xl items-center gap-10 sm:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
      <section>
        <Eyebrow>{t("Make it yours")}</Eyebrow>
        <h2
          data-step-heading
          tabIndex={-1}
          className="mt-3 text-3xl leading-tight font-semibold tracking-tight text-balance outline-none sm:text-4xl"
        >
          {t("Pick and choose.")}
        </h2>
        <p className="mt-4 text-base leading-7 text-pretty text-muted-foreground">
          {t("See what suits you. You can always change it later in Settings.")}
        </p>
        <p className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
          <LockIcon className="size-3.5 shrink-0" />
          {t("Everything is saved on your device.")}
        </p>
      </section>

      <Card className="gap-0 py-0 shadow-sm">
        <CardContent className="divide-y divide-border p-0">
          <SettingRow
            title={t("Language")}
            description={t("Pick the one you think in.")}
          >
            <LanguageSwitcher hideLabel />
          </SettingRow>
          <SettingRow
            title={t("Appearance")}
            description={t("Dark mode is easier on the eyes at 3am.")}
          >
            <AppearanceToggle />
          </SettingRow>
          <SettingRow
            title={t("Keep Upscayl updated")}
            description={t("Install updates automatically.")}
          >
            <Switch
              checked={autoUpdate}
              onCheckedChange={setAutoUpdate}
              aria-label={t("Keep Upscayl updated")}
            />
          </SettingRow>
          <SettingRow
            title={t("Help improve Upscayl")}
            description={t(
              "Sends usage stats, like app version and system info. Never your images.",
            )}
          >
            <Switch
              checked={enableContribution}
              onCheckedChange={setEnableContribution}
              aria-label={t("Help improve Upscayl")}
            />
          </SettingRow>
        </CardContent>
      </Card>
    </div>
  );
}
