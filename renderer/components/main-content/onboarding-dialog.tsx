import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { cn } from "@/lib/utils";
import SelectTheme from "@/components/sidebar/settings-tab/select-theme";
import {
  autoUpdateAtom,
  enableContributionAtom,
} from "@/atoms/user-settings-atom";
import { useAtom, useAtomValue } from "jotai";
import useTranslation from "../hooks/use-translation";
import LanguageSwitcher from "../sidebar/settings-tab/language-switcher";
import { localeAtom } from "@/atoms/translations-atom";

type OnboardingStep = {
  title: string;
  description: string;
  type: "info" | "settings";
  configurationOptions?: {
    key: string;
    type: "switch" | "input" | "video" | "component";
    label?: string;
    description?: string;
    videoSrc?: string;
    component?: any;
  }[];
};

export function OnboardingDialog() {
  const t = useTranslation();

  const [currentStep, setCurrentStep] = useState(0);
  const [settings, setSettings] = useState<Record<string, any>>({});
  const locale = useAtomValue(localeAtom);

  const [open, setOpen] = useState(false);

  const onboardingSteps: OnboardingStep[] = useMemo(
    () => [
      {
        title: t("ONBOARDING_DIALOG.STEP_1.TITLE"),
        description: t("ONBOARDING_DIALOG.STEP_1.DESCRIPTION"),
        type: "info",
        configurationOptions: [
          {
            type: "component",
            label: t("SETTINGS.LANGUAGE.TITLE"),
            component: <LanguageSwitcher hideLabel={true} />,
            key: "theme",
          },
        ],
      },
      {
        title: t("ONBOARDING_DIALOG.STEP_2.TITLE"),
        description: t("ONBOARDING_DIALOG.STEP_2.DESCRIPTION"),
        type: "settings",
        configurationOptions: [
          {
            type: "switch",
            label: t("SETTINGS.AUTO_UPDATE.TITLE"),
            key: "autoUpdate",
          },
          {
            type: "switch",
            label: t("SETTINGS.ENABLE_CONTRIBUTION.TITLE"),
            description: t("SETTINGS.ENABLE_CONTRIBUTION.DESCRIPTION"),
            key: "improveUpscayl",
          },
          {
            type: "component",
            label: t("SETTINGS.THEME.TITLE"),
            component: <SelectTheme hideLabel={true} />,
            key: "theme",
          },
        ],
      },
      {
        type: "info",
        title: t("ONBOARDING_DIALOG.STEP_3.TITLE"),
        description: t("ONBOARDING_DIALOG.STEP_3.DESCRIPTION"),
        configurationOptions: [
          {
            key: "video",
            type: "video",
            videoSrc:
              "https://www.youtube-nocookie.com/embed/3M77flVZlVY?autoplay=1",
          },
        ],
      },
      {
        title: t("ONBOARDING_DIALOG.STEP_4.TITLE"),
        description: t("ONBOARDING_DIALOG.STEP_4.DESCRIPTION"),
        type: "info",
      },
    ],
    [locale],
  );

  const currentStepData = onboardingSteps[currentStep];
  const isLastStep = currentStep === onboardingSteps.length - 1;
  const isFirstStep = currentStep === 0;
  const [autoUpdate, setAutoUpdate] = useAtom(autoUpdateAtom);
  const [enableContribution, setEnableContribution] = useAtom(
    enableContributionAtom,
  );

  useEffect(() => {
    const storedValue = localStorage.getItem("showOnboarding");
    if (storedValue !== null) {
      setOpen(JSON.parse(storedValue));
    } else {
      setOpen(true);
    }
  }, []);

  const handleNext = () => {
    if (isLastStep) {
      setOpen(false);
      localStorage.setItem("showOnboarding", JSON.stringify(false));
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(e) => {
        setOpen(e);
      }}
    >
      <DialogContent className="flex h-[80%] w-full max-w-[80%] flex-col items-center justify-center">
        <DialogHeader>
          <DialogTitle className="text-center text-4xl">
            {currentStepData.title}
          </DialogTitle>
          <DialogDescription className="text-center text-lg text-base-content/70">
            {currentStepData.description}
          </DialogDescription>
        </DialogHeader>

        {currentStepData.configurationOptions && (
          <div
            className={cn(
              "flex h-full w-full flex-col rounded-sm bg-primary p-8",
              "h-auto w-auto gap-8",
              currentStepData.configurationOptions[0].type === "video" &&
                "h-full w-full gap-0 p-0",
            )}
          >
            {currentStepData.configurationOptions.map((option) => (
              <div
                key={option.key}
                className="flex h-full w-full items-center justify-between gap-4"
                data-tooltip-id="tooltip"
                data-tooltip-content={
                  option.key === "improveUpscayl"
                    ? t("SETTINGS.ENABLE_CONTRIBUTION.DESCRIPTION")
                    : null
                }
              >
                {option.label && (
                  <label
                    htmlFor={option.key}
                    className="text-nowrap text-left text-sm uppercase text-primary-content"
                  >
                    {option.label}
                  </label>
                )}
                {option.type === "switch" && (
                  <input
                    type="checkbox"
                    className="toggle"
                    id={option.key}
                    checked={
                      option.key === "autoUpdate"
                        ? autoUpdate
                        : option.key === "improveUpscayl"
                          ? enableContribution
                          : false
                    }
                    onChange={(e) => {
                      if (option.key === "autoUpdate") {
                        setAutoUpdate(e.target.checked);
                      } else if (option.key === "improveUpscayl") {
                        setEnableContribution(e.target.checked);
                      }
                    }}
                  />
                )}
                {option.type === "input" && (
                  <input
                    className="input input-bordered"
                    id={option.key}
                    value={settings[option.key] || ""}
                    onChange={(e) =>
                      handleSettingChange(option.key, e.target.value)
                    }
                  />
                )}
                {option.type === "video" && (
                  <iframe
                    className="h-full w-full rounded-sm"
                    src={option.videoSrc}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                )}
                {option.type === "component" && option.component}
              </div>
            ))}
            {currentStepData.type === "settings" && (
              <p className="text-sm text-base-content/70">
                {t("ONBOARDING_DIALOG.SETTINGS_NOTE")}
              </p>
            )}
          </div>
        )}

        <DialogFooter className="gap-2 md:gap-0">
          {!isFirstStep && (
            <button
              onClick={() => setCurrentStep((prev) => prev - 1)}
              className="btn btn-primary w-40"
            >
              {t("ONBOARDING_DIALOG.BACK_BUTTON_TITLE")}
            </button>
          )}
          <button onClick={handleNext} className="btn btn-secondary w-40">
            {isLastStep
              ? t("ONBOARDING_DIALOG.GET_STARTED_BUTTON_TITLE")
              : t("ONBOARDING_DIALOG.NEXT_BUTTON_TITLE")}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
