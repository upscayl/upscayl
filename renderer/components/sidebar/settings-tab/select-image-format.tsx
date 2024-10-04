import { translationAtom } from "@/atoms/translations-atom";
import { useAtomValue } from "jotai";

type ImageFormatSelectProps = {
  batchMode: boolean;
  saveImageAs: string;
  setExportType: (arg: string) => void;
};

export function SelectImageFormat({
  batchMode,
  saveImageAs,
  setExportType,
}: ImageFormatSelectProps) {
  const t = useAtomValue(translationAtom);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row gap-1">
        <p className="text-sm font-medium">
          {t("SETTINGS.IMAGE_FORMAT.TITLE")}
        </p>
        {/* <p className="badge-primary badge text-[10px] font-medium">
          EXPERIMENTAL
        </p> */}
      </div>
      <div className="flex flex-col gap-2">
        {batchMode && <p className="text-xs text-base-content/80"></p>}
        <div className="flex flex-wrap gap-2">
          {/* PNG */}
          <button
            className={`btn ${saveImageAs === "png" && "btn-primary"}`}
            onClick={() => setExportType("png")}
          >
            {t("SETTINGS.IMAGE_FORMAT.PNG")}
          </button>
          {/* JPG */}
          <button
            className={`btn ${saveImageAs === "jpg" && "btn-primary"}`}
            onClick={() => setExportType("jpg")}
          >
            {t("SETTINGS.IMAGE_FORMAT.JPG")}
          </button>
          {/* WEBP */}
          <button
            className={`btn ${saveImageAs === "webp" && "btn-primary"}`}
            onClick={() => setExportType("webp")}
          >
            {t("SETTINGS.IMAGE_FORMAT.WEBP")}
          </button>
        </div>
      </div>
    </div>
  );
}
