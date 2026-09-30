import { cn } from "@/lib/utils";

export default function OverlayChip({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "pointer-events-none absolute inline-flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-md transition-opacity duration-200",
        className,
      )}
    >
      {children}
    </span>
  );
}
