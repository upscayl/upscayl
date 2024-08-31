import { atom } from "jotai";
import en from "../locales/en.json";
import ru from "../locales/ru.json";
import { atomWithStorage } from "jotai/utils";

// Define the shape of the translations
type Translations = typeof en;
type Locales = "en" | "ru";

// Utility function to access nested translation keys
const getNestedTranslation = (obj: Translations, key: string): string => {
  return (
    key.split(".").reduce((acc, part) => acc && (acc as any)[part], obj) || key
  );
};

// Atom to store the current locale
export const localeAtom = atomWithStorage<Locales>("language", "en");

// Atom to get the translation function based on the current locale
export const translationAtom = atom((get) => {
  const locale = get(localeAtom);
  const translations: Record<Locales, Translations> = { en, ru };

  return (key: string, params: Record<string, string> = {}): string => {
    const template = getNestedTranslation(translations[locale], key);

    // Replace placeholders with parameters, e.g., {name} => John
    return Object.keys(params).reduce(
      (str, paramKey) => str.replace(`{${paramKey}}`, params[paramKey]),
      template,
    );
  };
});
