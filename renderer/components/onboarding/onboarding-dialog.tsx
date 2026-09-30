import { useEffect, useRef, useState } from "react";
import { Dialog as DialogPrimitive } from "radix-ui";

import useTranslation from "@/components/hooks/use-translation";
import Kbd from "@/components/onboarding/shared/kbd";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ELECTRON_COMMANDS } from "@common/electron-commands";
import DotGrid from "./dot-grid";
import FeaturesStep from "./steps/features/features-step";
import PreferencesStep from "./steps/preferences/preferences-step";
import ReadyStep from "./steps/ready/ready-step";
import WelcomeStep from "./steps/welcome/welcome-step";
import StepProgress from "./step-progress";

const steps = [WelcomeStep, FeaturesStep, PreferencesStep, ReadyStep];
const TOTAL_STEPS = steps.length;

const ENTER_OPT_OUT = "button, a[href], input, select, textarea";
const ARROW_OPT_OUT = 'input, select, textarea, [role="combobox"]';

export function OnboardingDialog() {
  const t = useTranslation();
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [open, setOpen] = useState(
    () => localStorage.getItem("showOnboarding") !== "false",
  );
  const contentRef = useRef<HTMLDivElement>(null);

  const isMac = window.electron.platform === "mac";
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === TOTAL_STEPS - 1;
  const Step = steps[currentStep];

  const finishSetup = () => {
    localStorage.setItem("showOnboarding", "false");
    window.electron.send(ELECTRON_COMMANDS.ONBOARDING_COMPLETE);
    setOpen(false);
  };

  const goTo = (step: number) => {
    if (step < 0 || step >= TOTAL_STEPS) return;
    setDirection(step > currentStep ? "forward" : "back");
    setCurrentStep(step);
  };

  const goNext = () => (isLastStep ? finishSetup() : goTo(currentStep + 1));

  useEffect(() => {
    contentRef.current
      ?.querySelector<HTMLElement>("[data-step-heading]")
      ?.focus({ preventScroll: true });
  }, [currentStep]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // A control (e.g. an open select) already handled this key.
      if (event.defaultPrevented || event.metaKey || event.ctrlKey) return;

      const target = event.target as HTMLElement;
      if (event.key === "Enter") {
        if (!event.repeat && !target.closest(ENTER_OPT_OUT)) goNext();
      } else if (!target.closest(ARROW_OPT_OUT)) {
        if (event.key === "ArrowRight") goTo(currentStep + 1);
        if (event.key === "ArrowLeft") goTo(currentStep - 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentStep, open]);

  if (!open) return null;

  return (
    <DialogPrimitive.Root open>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Content
          ref={contentRef}
          aria-describedby={undefined}
          onEscapeKeyDown={(event) => event.preventDefault()}
          className="fixed inset-0 z-[100] flex flex-col overflow-hidden bg-background text-foreground outline-none"
        >
          <DialogPrimitive.Title className="sr-only">
            {t("First-run setup")}
          </DialogPrimitive.Title>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(60%_100%_at_50%_0%,color-mix(in_oklch,var(--foreground)_7%,transparent),transparent)]"
          />
          <DotGrid />

          <header className="relative flex h-14 shrink-0 items-center justify-between px-6 [-webkit-app-region:drag]">
            <div className="flex items-center gap-3">
              <img src="./logo.svg" alt="" className="size-7 rounded-lg" />
              <span className="text-sm font-semibold">Upscayl</span>
            </div>

            {!isLastStep && (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground [-webkit-app-region:no-drag]"
                onClick={finishSetup}
              >
                {t("Skip for now")}
              </Button>
            )}
          </header>

          <main className="relative flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto">
            <div
              key={currentStep}
              className={cn(
                "m-auto w-full animate-in px-8 py-4 duration-300 fade-in-0 motion-reduce:animate-none lg:px-12",
                direction === "forward"
                  ? "slide-in-from-right-4"
                  : "slide-in-from-left-4",
              )}
            >
              <Step />
            </div>
          </main>

          <footer className="relative flex h-[72px] shrink-0 items-center justify-between border-t border-border/70 px-6">
            <div className="flex items-center gap-4">
              <StepProgress current={currentStep} total={TOTAL_STEPS} />
              <span className="hidden text-xs text-muted-foreground tabular-nums sm:inline">
                {t("Step")} {currentStep + 1} {t("of")} {TOTAL_STEPS}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* macOS hides the native window buttons during setup, so the first step offers Quit instead of Back. */}
              {isFirstStep && isMac && (
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() =>
                    window.electron.send(ELECTRON_COMMANDS.QUIT_APP)
                  }
                >
                  {t("Quit")}
                </Button>
              )}
              {!isFirstStep && (
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={() => goTo(currentStep - 1)}
                >
                  {t("Back")}
                  <Kbd>←</Kbd>
                </Button>
              )}
              <Button size="lg" className="min-w-36 gap-2.5" onClick={goNext}>
                {isLastStep
                  ? t("Hit it!")
                  : isFirstStep
                    ? t("Let’s go")
                    : t("Continue")}
                <Kbd className="bg-primary-foreground/15 text-primary-foreground">
                  ↵
                </Kbd>
              </Button>
            </div>
          </footer>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
