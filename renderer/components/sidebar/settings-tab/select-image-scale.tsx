import { translationAtom } from "@/atoms/translations-atom";
import { useCustomWidthAtom } from "@/atoms/user-settings-atom";
import { useAtomValue } from "jotai";

type ImageScaleSelectProps = {
  scale: string;
  setScale: React.Dispatch<React.SetStateAction<string>>;
  hideInfo?: boolean;
};

export function SelectImageScale({
  scale,
  setScale,
  hideInfo,
}: ImageScaleSelectProps) {
  const useCustomWidth = useAtomValue(useCustomWidthAtom);
  const t = useAtomValue(translationAtom);

  return (
    <div className={`${useCustomWidth && "opacity-50"}`}>
      <div className="flex flex-row items-center gap-2">
        {hideInfo ? (
          <>
            <p className="text-sm">
              {t("SETTINGS.IMAGE_SCALE.TITLE")}{" "}
              <span className="text-xs">({scale}X)</span>
            </p>
            {hideInfo && parseInt(scale) >= 6 && (
              <span
                className="text-xs font-bold text-error"
                data-tooltip-id="tooltip"
                data-tooltip-content={t("SETTINGS.IMAGE_SCALE.WARNING")}
              >
                <svg
                  className="h-4 w-4"
                  stroke="currentColor"
                  fill="currentColor"
                  stroke-width="0"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M9.836 3.244c.963-1.665 3.365-1.665 4.328 0l8.967 15.504c.963 1.667-.24 3.752-2.165 3.752H3.034c-1.926 0-3.128-2.085-2.165-3.752ZM12 8.5a.75.75 0 0 0-.75.75v4.5a.75.75 0 0 0 1.5 0v-4.5A.75.75 0 0 0 12 8.5Zm1 9a1 1 0 1 0-2 0 1 1 0 0 0 2 0Z"></path>
                </svg>
              </span>
            )}
          </>
        ) : (
          <p className="text-sm font-medium">
            {t("SETTINGS.IMAGE_SCALE.TITLE")} ({scale}X){" "}
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
