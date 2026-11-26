import { translationAtom } from "@/atoms/translations-atom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAtomValue } from "jotai";
import {
  CopyCheckIcon,
  CopyIcon,
  useIconHover,
} from "@/components/animated-icons";
import React, { useEffect, useRef } from "react";

type LogAreaProps = {
  copyOnClickHandler: () => void;
  isCopied: boolean;
  logData: string[];
};

// TODO: Temporary function, remove later
const removeEmojies = (text: string) => {
  return text.replace(
    /[\p{Extended_Pictographic}\p{Emoji_Presentation}\uFE0F\u200D]/gu,
    "",
  );
};

export function LogArea({
  copyOnClickHandler,
  isCopied,
  logData,
}: LogAreaProps) {
  const bottomRef = useRef<HTMLParagraphElement>(null);
  const t = useAtomValue(translationAtom);
  const copyHover = useIconHover();

  // Draw the check when the logs have just been copied.
  useEffect(() => {
    if (isCopied) copyHover.ref.current?.startAnimation();
  }, [isCopied]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "instant" });
  }, [logData]);

  return (
    <div className="relative flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium">LOGS</p>
        <Button
          variant="outline"
          size="xs"
          onClick={copyOnClickHandler}
          {...copyHover.hoverProps}
        >
          {isCopied ? (
            <>
              <CopyCheckIcon ref={copyHover.ref} className="size-3" />
              <span>{t("COPIED ✅")}</span>
            </>
          ) : (
            <>
              <CopyIcon ref={copyHover.ref} className="size-3" />
              <span>{t("COPY LOGS 📋")}</span>
            </>
          )}
        </Button>
      </div>
      <ScrollArea className="h-86 rounded-sm border bg-card">
        <code className="flex flex-col gap-3 p-4 text-xs break-all">
          {logData.length === 0 && (
            <p className="text-muted-foreground">{t("No logs to show")}</p>
          )}

          {logData.map((logLine: any, i: number) => {
            return <p key={i}>{logLine}</p>;
          })}
          <p ref={bottomRef} />
        </code>
      </ScrollArea>
    </div>
  );
}
