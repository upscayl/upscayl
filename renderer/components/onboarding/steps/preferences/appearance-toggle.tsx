import { MoonIcon, SunIcon } from "lucide-react";

import useTranslation from "@/components/hooks/use-translation";
import { useTheme } from "@/components/theme/use-theme";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export default function AppearanceToggle() {
  const t = useTranslation();
  const { theme, setTheme } = useTheme();

  return (
    <ToggleGroup
      type="single"
      variant="outline"
      size="sm"
      spacing={0}
      // "system" (the provider default) has no stylesheet of its own and renders the light tokens.
      value={theme === "system" ? "light" : theme}
      onValueChange={(value) => value && setTheme(value)}
      aria-label={t("Appearance")}
    >
      <ToggleGroupItem value="light">
        <SunIcon />
        {t("Light")}
      </ToggleGroupItem>
      <ToggleGroupItem value="dark">
        <MoonIcon />
        {t("Dark")}
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
