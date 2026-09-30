import type { LucideIcon } from "lucide-react";

export default function IconTile({ icon: Icon }: { icon: LucideIcon }) {
  return (
    <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground ring-1 ring-foreground/10">
      <Icon className="size-4" />
    </span>
  );
}
