import { useEffect, useState } from "react";
import { useAtom, useAtomValue } from "jotai";
import { translationAtom } from "@/atoms/translations-atom";
import { engineAtom } from "@/atoms/user-settings-atom";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldLabel,
  FieldDescription,
} from "@/components/ui/field";
import { ELECTRON_COMMANDS } from "@common/electron-commands";
import type { EngineInfo } from "@common/types/types";

export function SelectEngine() {
  const [engine, setEngine] = useAtom(engineAtom);
  const [coremlAvailable, setCoremlAvailable] = useState(false);
  const t = useAtomValue(translationAtom);

  // Only Apple Silicon builds have the Core ML engine. Ask the main process before showing the choice.
  useEffect(() => {
    let unmounted = false;
    window.electron
      .invoke(ELECTRON_COMMANDS.ENGINE_INFO)
      .then((info: EngineInfo) => {
        if (!unmounted) setCoremlAvailable(info.coreml);
      })
      .catch(() => {
        if (!unmounted) setCoremlAvailable(false);
      });
    return () => {
      unmounted = true;
    };
  }, []);

  if (!coremlAvailable) return null;

  return (
    <Field orientation="horizontal">
      <FieldContent>
        <FieldLabel>{t("Engine")}</FieldLabel>
        <FieldDescription>
          {t(
            "Auto runs the models on the GPU and the Neural Engine through Core ML (Apple Silicon only) and uses ncnn for what Core ML cannot do, such as WebP output. GPU ID and tile size apply to ncnn only.",
          )}
        </FieldDescription>
      </FieldContent>

      <div className="flex flex-wrap gap-1">
        <Button
          variant={engine === "auto" ? "default" : "outline"}
          size="sm"
          onClick={() => setEngine("auto")}
        >
          {t("Auto")}
        </Button>
        <Button
          variant={engine === "ncnn" ? "default" : "outline"}
          size="sm"
          onClick={() => setEngine("ncnn")}
        >
          {t("ncnn (Vulkan)")}
        </Button>
      </div>
    </Field>
  );
}
