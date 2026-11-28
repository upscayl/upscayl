import { useEffect, useMemo, useRef, useState } from "react";
import { useSetAtom } from "jotai";
import {
  CornerDownLeftIcon,
  CpuIcon,
  FileImageIcon,
  FolderOpenIcon,
  HelpCircleIcon,
  HomeIcon,
  ImageIcon,
  ImageOffIcon,
  MonitorCogIcon,
  PaletteIcon,
  ScrollTextIcon,
  SearchIcon,
  SettingsIcon,
  type LucideIcon,
} from "lucide-react";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { showSettingsDialogAtom } from "@/atoms/toggle-settings";
import {
  settingsCategoryAtom,
  type SettingsCategory,
} from "@/atoms/settings-category-atom";
import useTranslation from "@/components/hooks/use-translation";
import type { AppTab } from "@/components/sidenav";
import {
  CommandIcon,
  useIconHover,
  type AnimatedIconHandle,
} from "@/components/animated-icons";
import { cn } from "@/lib/utils";
import { KbdGroup, Kbd } from "./ui/kbd";

type CommandItem = {
  id: string;
  label: string;
  group: string;
  icon: LucideIcon;
  keywords?: string;
  run: () => void;
};

type SettingEntry = {
  // Matches a `data-setting` attribute rendered inside the settings dialog.
  id: string;
  label: string;
  keywords?: string;
};

const CATEGORIES: {
  id: SettingsCategory;
  label: string;
  icon: LucideIcon;
  settings: SettingEntry[];
}[] = [
  {
    id: "appearance",
    label: "Appearance",
    icon: PaletteIcon,
    settings: [
      { id: "language", label: "Language", keywords: "locale translation" },
      {
        id: "reduce-animations",
        label: "Reduce Animations",
        keywords: "motion accessibility static icons",
      },
      { id: "theme", label: "Theme", keywords: "dark light color glass" },
    ],
  },
  {
    id: "ai-models",
    label: "AI Models",
    icon: CpuIcon,
    settings: [
      { id: "gpu-id", label: "GPU ID", keywords: "graphics device" },
      { id: "tile-size", label: "Tile Size", keywords: "memory vram" },
      { id: "tta-mode", label: "TTA Mode", keywords: "test time augmentation" },
      {
        id: "custom-models-folder",
        label: "Custom Models Folder",
        keywords: "import model path",
      },
    ],
  },
  {
    id: "image-settings",
    label: "Image Settings",
    icon: ImageIcon,
    settings: [
      {
        id: "image-format",
        label: "Image Format",
        keywords: "png jpg webp save as",
      },
      { id: "copy-metadata", label: "Copy Metadata", keywords: "exif" },
      { id: "image-scale", label: "Image Scale", keywords: "zoom factor" },
      {
        id: "custom-resolution",
        label: "Custom Resolution",
        keywords: "width size",
      },
      { id: "compression", label: "Compression", keywords: "quality" },
      {
        id: "save-output-folder",
        label: "Remember Output Folder",
        keywords: "save path",
      },
      { id: "overwrite", label: "Overwrite Files", keywords: "replace" },
    ],
  },
  {
    id: "system",
    label: "System",
    icon: MonitorCogIcon,
    settings: [
      { id: "notifications", label: "Notifications", keywords: "alerts" },
      { id: "auto-update", label: "Auto Update", keywords: "updates" },
      {
        id: "contributions",
        label: "Contributions",
        keywords: "analytics telemetry",
      },
      { id: "reset-settings", label: "Reset Settings", keywords: "defaults" },
      { id: "system-info", label: "System Info", keywords: "version os" },
    ],
  },
  { id: "logs", label: "Logs", icon: ScrollTextIcon, settings: [] },
  { id: "help", label: "Help", icon: HelpCircleIcon, settings: [] },
];

const scrollToSetting = (settingId: string) => {
  const selector = `[data-setting="${settingId}"]`;
  const highlight = (el: HTMLElement) => {
    el.scrollIntoView({ block: "center", behavior: "smooth" });
    el.classList.add("setting-highlight");
    setTimeout(() => el.classList.remove("setting-highlight"), 1600);
  };

  const existing = document.querySelector<HTMLElement>(selector);
  if (existing) return highlight(existing);

  // The settings dialog mounts after the palette closes; watch the DOM for the
  // setting instead of polling, and give up after 3 s.
  const observer = new MutationObserver(() => {
    const el = document.querySelector<HTMLElement>(selector);
    if (!el) return;
    observer.disconnect();
    clearTimeout(timeout);
    highlight(el);
  });
  const timeout = setTimeout(() => observer.disconnect(), 3000);
  observer.observe(document.body, { childList: true, subtree: true });
};

const CommandPalette = ({
  onTabChange,
  onSelectImage,
  onSelectFolder,
}: {
  onTabChange: (tab: AppTab) => void;
  onSelectImage: () => void;
  onSelectFolder: () => void;
}) => {
  const t = useTranslation();
  const searchHover = useIconHover();
  const isMac = window.electron.platform === "mac";
  const dialogSearchRef = useRef<AnimatedIconHandle>(null);
  const setShowSettings = useSetAtom(showSettingsDialogAtom);
  const setCategory = useSetAtom(settingsCategoryAtom);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setActiveIndex(0);
    // The dialog content mounts after `open` flips; play the icon once it exists.
    const id = setTimeout(() => dialogSearchRef.current?.startAnimation(), 100);
    return () => clearTimeout(id);
  }, [open]);

  const items = useMemo<CommandItem[]>(() => {
    const openSettings = (category: SettingsCategory, settingId?: string) => {
      setCategory(category);
      setShowSettings(true);
      if (settingId) scrollToSetting(settingId);
    };

    const list: CommandItem[] = [
      {
        id: "tab-home",
        label: t("Home"),
        group: t("Navigation"),
        icon: HomeIcon,
        keywords: "upscale upscayl",
        run: () => onTabChange("home"),
      },
      {
        id: "tab-remove-bg",
        label: t("Remove background"),
        group: t("Navigation"),
        icon: ImageOffIcon,
        keywords: "cutout transparent",
        run: () => onTabChange("remove-background"),
      },
      {
        id: "select-image",
        label: t("Select Image"),
        group: t("Actions"),
        icon: FileImageIcon,
        keywords: "open file",
        run: () => {
          onTabChange("home");
          onSelectImage();
        },
      },
      {
        id: "select-folder",
        label: t("Select Folder"),
        group: t("Actions"),
        icon: FolderOpenIcon,
        keywords: "batch open directory",
        run: () => {
          onTabChange("home");
          onSelectFolder();
        },
      },
      {
        id: "settings",
        label: t("Settings"),
        group: t("Settings"),
        icon: SettingsIcon,
        keywords: "preferences",
        run: () => setShowSettings(true),
      },
    ];

    for (const cat of CATEGORIES) {
      list.push({
        id: `cat-${cat.id}`,
        label: cat.label,
        group: t("Settings"),
        icon: cat.icon,
        keywords: "settings",
        run: () => openSettings(cat.id),
      });
      for (const s of cat.settings) {
        list.push({
          id: `setting-${s.id}`,
          label: `${cat.label} › ${s.label}`,
          group: t("Settings"),
          icon: cat.icon,
          keywords: s.keywords,
          run: () => openSettings(cat.id, s.id),
        });
      }
    }
    return list;
  }, [
    t,
    onTabChange,
    onSelectImage,
    onSelectFolder,
    setCategory,
    setShowSettings,
  ]);

  const filtered = useMemo(() => {
    const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    if (!terms.length) return items;
    return items.filter((item) => {
      const hay =
        `${item.label} ${item.group} ${item.keywords ?? ""}`.toLowerCase();
      return terms.every((term) => hay.includes(term));
    });
  }, [items, query]);

  useEffect(() => setActiveIndex(0), [query]);

  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const runItem = (item?: CommandItem) => {
    if (!item) return;
    setOpen(false);
    // Let the palette dialog close before opening another one.
    setTimeout(item.run, 0);
  };

  const onInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || (e.ctrlKey && e.key === "n")) {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, Math.min(i + 1, filtered.length - 1)));
    } else if (e.key === "ArrowUp" || (e.ctrlKey && e.key === "p")) {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      runItem(filtered[activeIndex]);
    }
  };

  let lastGroup = "";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        {...searchHover.hoverProps}
        className="flex h-9 min-w-62 items-center gap-2 rounded-xl border bg-background/40 px-3 text-sm text-muted-foreground outline-none hover:bg-accent focus-visible:ring-2"
      >
        <SearchIcon className="size-4" />
        <span>{t("Search")}</span>
        <KbdGroup className="ml-auto">
          {isMac ? (
            <Kbd>
              <CommandIcon className="size-3" />
            </Kbd>
          ) : (
            <Kbd>Ctrl</Kbd>
          )}
          <span>+</span>
          <Kbd>K</Kbd>
        </KbdGroup>
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={false}
          overlayClassName="supports-backdrop-filter:backdrop-blur-none"
          className="top-[20%] translate-y-0 gap-0 overflow-hidden rounded-3xl bg-popover/50 p-0 shadow-2xl backdrop-blur-xl backdrop-saturate-150 sm:max-w-xl"
        >
          <DialogTitle className="sr-only">{t("Command palette")}</DialogTitle>
          <div className="flex items-center gap-2 border-b px-3">
            <SearchIcon className="size-4" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onInputKeyDown}
              placeholder={t("Search settings, tools and actions...")}
              className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div ref={listRef} className="max-h-80 overflow-y-auto p-2">
            {filtered.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                {t("No results found.")}
              </p>
            )}
            {filtered.map((item, index) => {
              const showGroup = item.group !== lastGroup;
              lastGroup = item.group;
              const Icon = item.icon;
              return (
                <div key={item.id}>
                  {showGroup && (
                    <div className="px-2 pt-2 pb-1 text-xs font-medium text-muted-foreground">
                      {item.group}
                    </div>
                  )}
                  <button
                    type="button"
                    data-index={index}
                    onMouseMove={() => setActiveIndex(index)}
                    onClick={() => runItem(item)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm",
                      index === activeIndex
                        ? "bg-primary/10 text-primary"
                        : "text-foreground",
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span className="flex-1 truncate">{item.label}</span>
                    {index === activeIndex && (
                      <CornerDownLeftIcon className="size-3.5 opacity-60" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CommandPalette;
