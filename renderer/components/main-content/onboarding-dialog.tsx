import { useEffect, useState } from "react";
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
import { useAtom } from "jotai";

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

const onboardingSteps: OnboardingStep[] = [
  {
    title: "Welcome to Upscayl 🎉",
    description: "Let's get you started with a few quick steps.",
    type: "info",
  },
  {
    title: "Choose Your Preferences 🎨",
    description: "Configure your initial settings.",
    type: "settings",
    configurationOptions: [
      {
        type: "switch",
        label: "Enable automatic updates",
        key: "autoUpdate",
      },
      {
        type: "switch",
        label: "Help Improve Upscayl",
        description: "Send anonymous usage data to help improve Upscayl.",
        key: "improveUpscayl",
      },
      {
        type: "component",
        label: "Theme",
        component: <SelectTheme hideLabel={true} />,
        key: "theme",
      },
    ],
  },
  {
    title: "How do I use Upscayl? 🚀",
    type: "info",
    description: "Watch this short video to learn about the new features.",
    configurationOptions: [
      {
        key: "video",
        type: "video",
        videoSrc: "https://www.youtube-nocookie.com/embed/3M77flVZlVY",
      },
    ],
  },
  {
    title: "You're All Set! 🎉",
    description: "You can now start upscaling your images.",
    type: "info",
  },
];

export function OnboardingDialog() {
  const [currentStep, setCurrentStep] = useState(0);
  const [settings, setSettings] = useState<Record<string, any>>({});

  const [open, setOpen] = useState(false);

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
              "flex h-full w-full flex-col rounded-sm bg-primary p-8 ",
              currentStepData.type === "settings" && "h-auto w-auto gap-8",
            )}
          >
            {currentStepData.configurationOptions.map((option) => (
              <div
                key={option.key}
                className="flex h-full w-full items-center justify-between gap-4"
              >
                {option.label && (
                  <label
                    htmlFor={option.key}
                    className="text-balance text-left  text-sm uppercase text-primary-content"
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
                    className="h-full w-full"
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
          </div>
        )}

        <DialogFooter className="gap-2 md:gap-0">
          <button onClick={handleNext} className="btn btn-secondary w-40">
            {isLastStep ? "Get Started" : "Next"}
          </button>
          {!isFirstStep && (
            <button
              onClick={() => setCurrentStep((prev) => prev - 1)}
              className="btn btn-primary w-40"
            >
              Back
            </button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
