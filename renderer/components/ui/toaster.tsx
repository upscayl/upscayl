import { XIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <div className="toast toast-end toast-top z-[100]">
      {toasts.map(function ({
        id,
        title,
        description,
        action,
        variant,
        open,
        onOpenChange,
      }) {
        return (
          <div
            key={id}
            className={cn(
              "alert w-full max-w-md items-start gap-4 shadow-lg transition-opacity",
              variant === "destructive"
                ? "alert-error"
                : "border-base-content/10 bg-base-100 text-base-content border",
              open === false && "pointer-events-none opacity-0",
            )}
          >
            <div className="flex-1">
              <div className="flex items-start justify-between gap-3">
                <div className="grid gap-1">
                  {title && (
                    <div className="text-sm font-semibold">{title}</div>
                  )}
                  {description && (
                    <div className="text-sm opacity-90">{description}</div>
                  )}
                </div>
                <button
                  className="btn btn-ghost btn-xs"
                  onClick={() => onOpenChange?.(false)}
                >
                  <XIcon className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </button>
              </div>
              {action && (
                <div className="mt-3 flex flex-wrap gap-2">{action}</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
