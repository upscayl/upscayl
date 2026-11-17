import { useSetAtom } from "jotai";
import { clearHistoryAtom } from "@/atoms/history-atom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import useTranslation from "../hooks/use-translation";

export const ClearHistoryDialog = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const t = useTranslation();
  const clearHistory = useSetAtom(clearHistoryAtom);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-96">
        <DialogHeader>
          <DialogTitle>{t("Clear all history?")}</DialogTitle>
          <DialogDescription>
            {t(
              "This deletes every saved copy in your History folder. Your own images and upscayled files stay untouched.",
            )}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t("Cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              clearHistory();
              onOpenChange(false);
            }}
          >
            {t("Clear all")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
