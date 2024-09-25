import { translationAtom } from "@/atoms/translations-atom";
import { useAtomValue } from "jotai";

type CompressionInputProps = {
  compression: number;
  handleCompressionChange: (arg: any) => void;
};

export function InputCompression({
  compression,
  handleCompressionChange,
}: CompressionInputProps) {
  const t = useAtomValue(translationAtom);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1 text-sm font-medium uppercase">
        <p className="shrink-0">
          {t("SETTINGS.IMAGE_COMPRESSION.TITLE", {
            compression: compression.toString(),
          })}
        </p>
      </div>
      {compression > 0 && (
        <p className="text-xs text-base-content/80">
          {t("SETTINGS.IMAGE_COMPRESSION.DESCRIPTION")}
        </p>
      )}
      <input
        type="range"
        placeholder="Type here"
        className="range range-primary w-full max-w-xs"
        min={0}
        max={100}
        value={compression}
        onChange={handleCompressionChange}
      />
    </div>
  );
}
