import { localeAtom, translationAtom } from "@/atoms/translations-atom";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@/components/ui/select";
import { useAtom, useAtomValue, useSetAtom } from "jotai";

const locales = {
  ar: "العربية",
  en: "English",
  tr: "Türkçe",
  ru: "Русский",
  uk: "Українська",
  ja: "日本語",
  zh: "简体中文",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  vi: "Tiếng Việt",
  pt: "Português (Portugal)",
  ptBR: "Português (Brasil)",
  id: "Bahasa Indonesia",
  caVAL: "Català (Valencià)",
  hu: "Magyar",
  pl: "Polski",
};

const LanguageSwitcher = ({ hideLabel = false }: { hideLabel?: boolean }) => {
  const [locale, setLocale] = useAtom(localeAtom);
  const t = useAtomValue(translationAtom);

  return (
    <div className="flex flex-col gap-2">
      {!hideLabel && (
        <p className="text-sm font-medium">{t("SETTINGS.LANGUAGE.TITLE")}</p>
      )}
      <Select
        value={locale}
        onValueChange={(value) => setLocale(value as keyof typeof locales)}
      >
        <SelectTrigger className="bg-base-100 dark:bg-base-100 min-w-28 border-none">
          <SelectValue placeholder="Theme" />
        </SelectTrigger>
        <SelectContent className="bg-background">
          <SelectGroup>
            {Object.entries(locales)
              .sort(([, a], [, b]) => a.localeCompare(b))
              .map((entry) => {
                const [locale, label] = entry;
                return (
                  <SelectItem value={locale} key={locale}>
                    {label.toLocaleUpperCase()}
                  </SelectItem>
                );
              })}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSwitcher;
