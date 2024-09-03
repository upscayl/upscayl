import { translationAtom } from "@/atoms/translations-atom";
import { useCustomWidthAtom } from "@/atoms/userSettingsAtom";
import { useAtomValue } from "jotai";

type ImageScaleSelectProps = {
  scale: string;
  setScale: React.Dispatch<React.SetStateAction<string>>;
  hideInfo?: boolean;
};

export function ImageScaleSelect({
  scale,
  setScale,
  hideInfo,
}: ImageScaleSelectProps) {
  const useCustomWidth = useAtomValue(useCustomWidthAtom);
  const t = useAtomValue(translationAtom);

  return (
    <div className={`${useCustomWidth && "opacity-50"}`}>
      <div className="flex flex-row gap-1">
        {hideInfo ? (
          <>
            <p className="text-sm">
              {t("SETTINGS.IMAGE_SCALE.TITLE")}{" "}
              <span className="text-xs">
                {t("SETTINGS.IMAGE_SCALE.IMAGE_SCALED_BY", {
                  scale,
                })}
              </span>
            </p>
            {hideInfo && parseInt(scale) >= 6 && (
              <p
                className="badge badge-warning text-xs font-bold"
                data-tooltip-id="tooltip"
                data-tooltip-content={t("SETTINGS.IMAGE_SCALE.WARNING")}
              >
                !
              </p>
            )}
          </>
        ) : (
          <p className="text-sm font-medium">
            {t("SETTINGS.IMAGE_SCALE.TITLE")}{" "}
            {t("SETTINGS.IMAGE_SCALE.IMAGE_SCALED_BY", {
              scale,
            })}{" "}
            {useCustomWidth && "DISABLED"}
          </p>
        )}
      </div>
      {!hideInfo && (
        <p className="text-xs text-base-content/80">
          {t("SETTINGS.IMAGE_SCALE.DESCRIPTION")}
        </p>
      )}
      {!hideInfo && parseInt(scale) >= 6 && (
        <p className="text-xs text-base-content/80 text-red-500">
          {t("SETTINGS.IMAGE_SCALE.ADDITIONAL_WARNING")}
        </p>
      )}

      <input
        type="range"
        min="1"
        max="16"
        placeholder="Example: 1320"
        value={scale}
        onChange={(e: any) => {
          setScale(e.target.value.toString());
        }}
        step="1"
        className="range range-primary mt-2"
        disabled={useCustomWidth}
      />
    </div>
  );
}
