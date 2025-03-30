import { localeAtom, translationAtom } from "@/atoms/translations-atom";
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
};

const LanguageSwitcher = ({ hideLabel = false }: { hideLabel?: boolean }) => {
  const [locale, setLocale] = useAtom(localeAtom);
  const t = useAtomValue(translationAtom);

  return (
    <div>
      <div className="flex flex-col gap-2">
        {!hideLabel && (
          <p className="text-sm font-medium">{t("SETTINGS.LANGUAGE.TITLE")}</p>
        )}
        <select
          data-choose-theme
          className="select select-primary"
          value={useAtomValue(localeAtom)}
          onChange={(e) => setLocale(e.target.value as keyof typeof locales)}
        >
          {Object.entries(locales)
            .sort(([, a], [, b]) => a.localeCompare(b))
            .map((entry) => {
              const [locale, label] = entry;
              return (
                <option value={locale} key={locale}>
                  {label.toLocaleUpperCase()}
                </option>
              );
            })}
        </select>
      </div>
    </div>
  );
};

export default LanguageSwitcher;
