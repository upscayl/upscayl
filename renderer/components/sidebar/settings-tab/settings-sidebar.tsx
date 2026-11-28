import { useAtom } from "jotai";
import {
  PaletteIcon,
  CpuIcon,
  ImageSettingsIcon,
  MonitorCogIcon,
  FileTextIcon,
  HelpIcon,
  type AnimatedIcon,
  useIconActive,
} from "@/components/animated-icons";
import { cn } from "@/lib/utils";
import {
  settingsCategoryAtom,
  SettingsCategory,
} from "@/atoms/settings-category-atom";

interface NavItem {
  id: SettingsCategory;
  label: string;
  icon: AnimatedIcon;
}

function SettingsNavButton({
  item: { label, icon: Icon },
  isActive,
  onClick,
}: {
  item: NavItem;
  isActive: boolean;
  onClick: () => void;
}) {
  const iconHover = useIconActive();

  return (
    <button
      type="button"
      onClick={onClick}
      {...iconHover.activeProps}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors",
        isActive
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      <Icon ref={iconHover.ref} className="size-4 shrink-0" />
      <span className="truncate">{label}</span>
    </button>
  );
}

function SettingsSidebar() {
  const [activeCategory, setActiveCategory] = useAtom(settingsCategoryAtom);

  const navItems: NavItem[] = [
    { id: "appearance", label: "Appearance", icon: PaletteIcon },
    { id: "ai-models", label: "AI Models", icon: CpuIcon },
    { id: "image-settings", label: "Image Settings", icon: ImageSettingsIcon },
    { id: "system", label: "System", icon: MonitorCogIcon },
    { id: "logs", label: "Logs", icon: FileTextIcon },
    { id: "help", label: "Help", icon: HelpIcon },
  ];

  return (
    <nav className="flex h-full w-48 shrink-0 flex-col gap-1 border-r pt-2 pr-3">
      {navItems.map((item) => (
        <SettingsNavButton
          key={item.id}
          item={item}
          isActive={activeCategory === item.id}
          onClick={() => setActiveCategory(item.id)}
        />
      ))}
    </nav>
  );
}

export default SettingsSidebar;
