import * as React from "react";

import { cn } from "@/lib/utils";

type ToastProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  variant?: "default" | "destructive";
};

type ToastActionProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  altText: string;
};

const ToastAction = React.forwardRef<HTMLButtonElement, ToastActionProps>(
  ({ className, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn("btn btn-sm", className)}
      {...props}
    />
  ),
);
ToastAction.displayName = "ToastAction";

type ToastActionElement = React.ReactElement<typeof ToastAction>;

export { type ToastProps, type ToastActionElement, ToastAction };
