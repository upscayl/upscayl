import { cn } from "@/lib/utils";

export default function StepProgress({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  return (
    <div
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={current + 1}
      className="flex items-center gap-1.5"
    >
      {Array.from({ length: total }).map((_, index) => (
        <span
          key={index}
          className={cn(
            "h-1 w-6 rounded-full transition-colors duration-300",
            index <= current ? "bg-primary" : "bg-foreground/10",
          )}
        />
      ))}
    </div>
  );
}
