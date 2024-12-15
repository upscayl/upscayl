import { translationAtom } from "@/atoms/translations-atom";
import { useAtomValue } from "jotai";
import React, { useEffect } from "react";
import { themeChange } from "theme-change";

const SelectTheme = ({ hideLabel }: { hideLabel?: boolean }) => {
  const availableThemes = [
    { label: "upscayl", value: "upscayl" },
    { label: "light", value: "light" },
    { label: "dark", value: "dark" },
    { label: "cupcake", value: "cupcake" },
    { label: "bumblebee", value: "bumblebee" },
    { label: "emerald", value: "emerald" },
    { label: "corporate", value: "corporate" },
    { label: "synthwave", value: "synthwave" },
    { label: "retro", value: "retro" },
    { label: "cyberpunk", value: "cyberpunk" },
    { label: "valentine", value: "valentine" },
    { label: "halloween", value: "halloween" },
    { label: "garden", value: "garden" },
    { label: "forest", value: "forest" },
    { label: "aqua", value: "aqua" },
    { label: "lofi", value: "lofi" },
    { label: "pastel", value: "pastel" },
    { label: "fantasy", value: "fantasy" },
    { label: "wireframe", value: "wireframe" },
    { label: "black", value: "black" },
    { label: "luxury", value: "luxury" },
    { label: "dracula", value: "dracula" },
    { label: "cmyk", value: "cmyk" },
    { label: "autumn", value: "autumn" },
    { label: "business", value: "business" },
    { label: "acid", value: "acid" },
    { label: "lemonade", value: "lemonade" },
    { label: "night", value: "night" },
    { label: "coffee", value: "coffee" },
    { label: "winter", value: "winter" },
  ];
  const t = useAtomValue(translationAtom);

  useEffect(() => {
    themeChange(false);
  }, []);

  return (
    <div className="flex w-full flex-col gap-2">
      {!hideLabel && (
        <p className="text-sm font-medium">{t("SETTINGS.THEME.TITLE")}</p>
      )}
      <select data-choose-theme className="select select-primary">
        {availableThemes.map((theme) => {
          return (
            <option value={theme.value} key={theme.value}>
              {theme.label.toLocaleUpperCase()}
            </option>
          );
        })}
      </select>
    </div>
  );
};

export default SelectTheme;
