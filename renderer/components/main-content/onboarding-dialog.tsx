import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";

type OnboardingStep = {
  title: string;
  description: string;
  type: "info" | "settings";
  settings?: {
    type: "switch" | "input";
    label: string;
    key: string;
  }[];
};

const onboardingSteps: OnboardingStep[] = [
  {
    title: "Welcome to Upscayl 🎉",
    description: "Let's get you started with a few quick steps.",
    type: "info",
  },
  {
    title: "Choose Your Preferences",
    description: "Configure your initial settings.",
    type: "settings",
    settings: [
      {
        type: "switch",
        label: "Enable automatic updates",
        key: "autoUpdate",
      },
      {
        type: "input",
        label: "Default output folder",
        key: "outputFolder",
      },
    ],
  },
  {
    title: "You're All Set!",
    description: "You can now start upscaling your images.",
    type: "info",
  },
];

export function OnboardingDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [settings, setSettings] = useState<Record<string, any>>({});

  const currentStepData = onboardingSteps[currentStep];
  const isLastStep = currentStep === onboardingSteps.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (isLastStep) {
      onOpenChange(false);
      // Here you can handle saving the settings
      console.log("Final settings:", settings);
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[80%] w-full max-w-[80%] flex-col items-center justify-center">
        <DialogHeader>
          <DialogTitle className="text-center text-4xl">
            {currentStepData.title}
          </DialogTitle>
          <DialogDescription className="text-center text-lg">
            {currentStepData.description}
          </DialogDescription>
        </DialogHeader>

        {currentStepData.type === "settings" && currentStepData.settings && (
          <div className="grid gap-4 py-4">
            {currentStepData.settings.map((setting) => (
              <div
                key={setting.key}
                className="grid grid-cols-2 items-center gap-4"
              >
                <label htmlFor={setting.key} className="text-right">
                  {setting.label}
                </label>
                {setting.type === "switch" && (
                  <input
                    type="checkbox"
                    className="toggle"
                    defaultChecked
                    id={setting.key}
                    checked={settings[setting.key] || false}
                    onChange={(e) =>
                      handleSettingChange(setting.key, e.target.checked)
                    }
                  />
                )}
                {setting.type === "input" && (
                  <input
                    className="input input-bordered"
                    id={setting.key}
                    value={settings[setting.key] || ""}
                    onChange={(e) =>
                      handleSettingChange(setting.key, e.target.value)
                    }
                  />
                )}
              </div>
            ))}
          </div>
        )}

        <DialogFooter>
          <button onClick={handleNext} className="btn btn-secondary">
            {isLastStep ? "Get Started" : "Next"}
          </button>
          {!isFirstStep && (
            <button
              onClick={() => setCurrentStep((prev) => prev - 1)}
              className="btn btn-primary"
            >
              Back
            </button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
