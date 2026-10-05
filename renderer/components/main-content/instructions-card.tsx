import { translationAtom } from "@/atoms/translations-atom";
import { useAtomValue } from "jotai";
import { FolderOpenIcon, ImageIcon } from "lucide-react";

function InstructionsCard({ batchMode }: { batchMode: boolean }) {
  const t = useAtomValue(translationAtom);

  return (
    <div className="flex h-full flex-col items-center justify-center rounded-3xl border-2 border-dashed border-foreground/15 bg-background/40 p-6 text-center shadow-inner">
      {batchMode ? (
        <FolderOpenIcon
          className="mb-4 size-16 text-muted-foreground/70"
          strokeWidth={1.25}
        />
      ) : (
        <ImageIcon
          className="mb-4 size-16 text-muted-foreground/70"
          strokeWidth={1.25}
        />
      )}
      <p className="text-xl font-semibold">
        {batchMode ? t("Select a Folder") : t("No image loaded")}
      </p>
      {batchMode ? (
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          {t(
            "Make sure that the folder doesn't contain anything except PNG, JPG, JPEG & WEBP images.",
          )}
        </p>
      ) : (
        <div className="mt-2 flex flex-col gap-2 text-sm text-muted-foreground">
          <p>{t("Upload or drag & drop an image to get started")}</p>
          <p>{t("Supports: PNG, JPG, JPEG, WEBP")}</p>
        </div>
      )}
    </div>
  );
}

export default InstructionsCard;
