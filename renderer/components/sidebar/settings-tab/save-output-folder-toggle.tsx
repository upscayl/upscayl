import { translationAtom } from "@/atoms/translations-atom";
import {
  savedOutputPathAtom,
  rememberOutputFolderAtom,
} from "@/atoms/user-settings-atom";
import { useAtom, useAtomValue } from "jotai";

export function SaveOutputFolderToggle() {
  const [outputPath, setOutputPath] = useAtom(savedOutputPathAtom);
  const [rememberOutputFolder, setRememberOutputFolder] = useAtom(
    rememberOutputFolderAtom,
  );
  const t = useAtomValue(translationAtom);

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium">
        {t("SETTINGS.SAVE_OUTPUT_FOLDER.TITLE")}
      </p>
      <p className="text-xs text-base-content/80">
        {t("SETTINGS.SAVE_OUTPUT_FOLDER.DESCRIPTION")}
      </p>

      <p className="font-mono text-sm">{outputPath}</p>
      <input
        type="checkbox"
        className="toggle"
        checked={rememberOutputFolder}
        onClick={() => {
          setRememberOutputFolder((oldValue) => {
            if (oldValue === true) {
              setOutputPath("");
            }
            return !oldValue;
          });
          localStorage.setItem(
            "rememberOutputFolder",
            JSON.stringify(!rememberOutputFolder),
          );
        }}
      />
    </div>
  );
}
