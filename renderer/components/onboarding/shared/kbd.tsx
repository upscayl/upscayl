import { cn } from "@/lib/utils";

export default function Kbd({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <kbd
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded-md bg-foreground/10 px-1 font-sans text-[11px] leading-none font-medium text-muted-foreground",
        className,
      )}
    >
      {children}
    </kbd>
  );
}
