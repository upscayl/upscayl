import { useSetAtom } from "jotai";
import { HomeIcon, ImageOffIcon, SettingsIcon } from "lucide-react";

import { showSettingsDialogAtom } from "@/atoms/toggle-settings";
import useTranslation from "@/components/hooks/use-translation";
import NavItem from "@/components/nav-item";

export type AppTab = "home" | "remove-background";

const Sidenav = ({
  activeTab,
  onTabChange,
}: {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
}) => {
  const t = useTranslation();
  const setShowSettings = useSetAtom(showSettingsDialogAtom);

  return (
    <nav className="flex w-14 shrink-0 flex-col items-center justify-between py-2">
      <div className="flex flex-col gap-2">
        <NavItem
          label={t("Home")}
          icon={HomeIcon}
          active={activeTab === "home"}
          onClick={() => onTabChange("home")}
        />
        <NavItem
          label={t("Remove background")}
          icon={ImageOffIcon}
          active={activeTab === "remove-background"}
          onClick={() => onTabChange("remove-background")}
        />
      </div>

      <NavItem
        label={t("Settings")}
        icon={SettingsIcon}
        onClick={() => setShowSettings(true)}
      />
    </nav>
  );
};

export default Sidenav;
