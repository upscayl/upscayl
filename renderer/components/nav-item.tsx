import { useIconHover, type AnimatedIcon } from "@/components/animated-icons";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export default function NavItem({
  label,
  icon: Icon,
  active,
  onClick,
}: {
  label: string;
  icon: AnimatedIcon;
  active?: boolean;
  onClick: () => void;
}) {
  const iconHover = useIconHover();

  return (
    <Tooltip delayDuration={400}>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          aria-label={label}
          aria-current={active ? "page" : undefined}
          className={cn(
            "size-11 rounded-2xl text-muted-foreground transition-colors hover:text-foreground",
            active &&
              "bg-primary/10 text-primary ring-1 ring-primary/15 hover:bg-primary/15 hover:text-primary",
          )}
          onClick={onClick}
          {...iconHover.hoverProps}
        >
          <Icon ref={iconHover.ref} className="size-5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}
