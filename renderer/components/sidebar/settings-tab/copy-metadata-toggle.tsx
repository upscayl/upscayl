import { translationAtom } from "@/atoms/translations-atom";
import { copyMetadataAtom } from "@/atoms/user-settings-atom";
import { useAtom, useAtomValue } from "jotai";

type CopyMetadataToggleProps = {
  saveImageAs: string;
};

const CopyMetadataToggle = ({ saveImageAs }: CopyMetadataToggleProps) => {
  const [copyMetadata, setCopyMetadata] = useAtom(copyMetadataAtom);
  const t = useAtomValue(translationAtom);

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium">
        {t("SETTINGS.COPY_METADATA.TITLE")}
      </p>
      <p className="text-xs text-base-content/80">
        {t("SETTINGS.COPY_METADATA.DESCRIPTION")}
      </p>
      <input
        type="checkbox"
        className="toggle"
        checked={copyMetadata}
        onChange={() => {
          setCopyMetadata((old) => {
            localStorage.setItem("copyMetadata", JSON.stringify(!old));
            return !old;
          });
        }}
      />
      {copyMetadata && saveImageAs !== "jpg" && (
        <p className="text-xs text-warning">
          {t("WARNING.METADATA_FORMAT.DESCRIPTION")}
        </p>
      )}
    </div>
  );
};

export default CopyMetadataToggle;