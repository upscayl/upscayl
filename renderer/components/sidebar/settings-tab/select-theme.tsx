import { translationAtom } from "@/atoms/translations-atom";
import { useTheme } from "@/components/theme/use-theme";
import { cn } from "@/lib/utils";
import { useAtomValue } from "jotai";
import { Check } from "lucide-react";
import React, { useEffect } from "react";
import { themeChange } from "theme-change";
const availableThemes = [
  { label: "Upscayl", value: "upscayl" },
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
  { label: "Claude", value: "claude" },
  { label: "Amethyst Haze", value: "amethyst-haze" },
  { label: "Caffeine Light", value: "caffeine-light" },
  { label: "Caffeine Dark", value: "caffeine-dark" },
  { label: "Violet Bloom", value: "violet-bloom" },
  { label: "Rose Bloom", value: "rose-bloom" },
  { label: "Catppuccin Frappé", value: "catppuccin-frappe" },
  { label: "Catppuccin Macchiato", value: "catppuccin-macchiato" },
  { label: "Catppuccin Mocha", value: "catppuccin-mocha" },
  { label: "Tokyo Night Day", value: "tokyo-night-day" },
  { label: "Tokyo Night", value: "tokyo-night" },
  { label: "Rosé Pine", value: "rose-pine" },
  { label: "Gruvbox", value: "gruvbox" },
  { label: "Dracula", value: "dracula" },
  { label: "Nord", value: "nord" },
  { label: "Ayu", value: "ayu" },
  { label: "Everforest", value: "everforest" },
  { label: "Vercel Light", value: "vercel-light" },
  { label: "Vercel Dark", value: "vercel-dark" },
  { label: "Vesper", value: "vesper" },
];

const ThemePreviewCard = ({
  theme,
  active,
  onSelect,
}: {
  theme: { label: string; value: string };
  active: boolean;
  onSelect: (value: string) => void;
}) => {
  return (
    <button
      type="button"
      onClick={() => onSelect(theme.value)}
      className="group flex flex-col items-center gap-2 focus:outline-none"
    >
      <div
        className={cn(
          theme.value,
          "relative w-full overflow-hidden rounded-lg border-2 bg-background transition-colors",
          "aspect-[4/3]",
          active
            ? "border-primary"
            : "border-border group-hover:border-foreground/30",
        )}
      >
        {active && (
          <div className="absolute top-1.5 right-1.5 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-primary">
            <Check
              className="h-2.5 w-2.5 text-primary-foreground"
              strokeWidth={3}
            />
          </div>
        )}

        <div className="flex h-full w-full flex-col">
          {/* top bar: logo mark + wordmark */}
          <div className="flex items-center gap-1 px-2 pt-2 pb-1.5">
            <div className="h-2.5 w-2.5 rounded-[2px] bg-primary" />
            <div className="h-1 w-6 rounded-full bg-foreground/60" />
          </div>

          {/* body: sidebar + content */}
          <div className="flex flex-1 gap-1.5 px-2 pb-2">
            {/* sidebar */}
            <div className="flex flex-col items-center gap-1.5 rounded-sm bg-transparent pt-0.5">
              <div className="h-3 w-3 rounded-[2px] bg-foreground/15" />
              <div className="h-3 w-3 rounded-[2px] bg-accent" />
              <div className="h-3 w-3 rounded-[2px] bg-foreground/15" />
            </div>

            {/* upload panel */}
            <div className="flex flex-1 flex-col gap-1 rounded-[3px] border border-dashed border-border bg-card p-1.5">
              <div className="h-0.5 w-4/5 rounded-full bg-foreground/25" />
              <div className="mt-auto flex flex-1 flex-col items-center justify-center gap-0.5">
                <div className="h-1.5 w-1.5 rounded-full bg-foreground/20" />
                <div className="h-0.5 w-3/5 rounded-full bg-foreground/20" />
              </div>
            </div>

            {/* main canvas */}
            <div className="flex flex-2 flex-col items-center justify-center gap-0.5 rounded-[3px] bg-muted">
              <div className="h-1 w-1/2 rounded-full bg-foreground/40" />
              <div className="h-0.5 w-2/3 rounded-full bg-foreground/20" />
            </div>
          </div>
        </div>
      </div>

      <span
        className={cn(
          "text-xs font-medium",
          active ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {theme.label}
      </span>
    </button>
  );
};

const SelectTheme = ({ hideLabel }: { hideLabel?: boolean }) => {
  const t = useAtomValue(translationAtom);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    themeChange(false);
  }, []);

  return (
    <div className="flex w-full flex-col gap-3">
      {!hideLabel && (
        <div>
          <p className="text-sm font-medium">{t("UPSCAYL THEME")}</p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-3">
        {availableThemes.map((t) => (
          <ThemePreviewCard
            key={t.value}
            theme={t}
            active={theme === t.value}
            onSelect={setTheme}
          />
        ))}
      </div>
    </div>
  );
};

export default SelectTheme;
