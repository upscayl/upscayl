import {
  savedOutputPathAtom,
  rememberOutputFolderAtom,
} from "@/atoms/userSettingsAtom";
import { useAtom } from "jotai";

export function SaveOutputFolderToggle() {
  const [outputPath, setOutputPath] = useAtom(savedOutputPathAtom);
  const [rememberOutputFolder, setRememberOutputFolder] = useAtom(
    rememberOutputFolderAtom,
  );
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium">SAVE OUTPUT FOLDER</p>
      <p className="text-xs text-base-content/80">
        If enabled, the output folder will be remembered between sessions.
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
