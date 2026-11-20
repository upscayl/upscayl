import React, { useEffect, useState } from "react";
import { ELECTRON_COMMANDS } from "@common/electron-commands";
import { useAtomValue } from "jotai";
import { translationAtom } from "@/atoms/translations-atom";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldContent,
} from "@/components/ui/field";

export function HistoryFolderSelect() {
  const t = useAtomValue(translationAtom);
  const [historyFolder, setHistoryFolder] = useState("");

  useEffect(() => {
    window.electron
      .invoke(ELECTRON_COMMANDS.GET_HISTORY_FOLDER)
      .then((path: string) => setHistoryFolder(path));
  }, []);

  return (
    <Field orientation="horizontal">
      <FieldContent>
        <FieldLabel>{t("HISTORY FOLDER")}</FieldLabel>

        <FieldDescription>
          {t(
            "Upscayl saves a copy of each original and result here for the History tab.",
          )}
          <span className="block text-sm text-muted-foreground">
            {historyFolder}
          </span>
        </FieldDescription>
      </FieldContent>

      <Button
        onClick={async () => {
          const historyFolderPath = await window.electron.invoke(
            ELECTRON_COMMANDS.SELECT_HISTORY_FOLDER,
          );

          if (historyFolderPath !== null) setHistoryFolder(historyFolderPath);
        }}
      >
        {t("Select Folder")}
      </Button>
    </Field>
  );
}
