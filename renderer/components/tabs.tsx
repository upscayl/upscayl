import { translationAtom } from "@/atoms/translations-atom";
import { useAtomValue } from "jotai";
import React from "react";

type TabsProps = {
  selectedTab: number;
  setSelectedTab: (tab: number) => void;
};

const Tabs = ({ selectedTab, setSelectedTab }: TabsProps) => {
  const t = useAtomValue(translationAtom);

  return (
    <div className="tabs-boxed tabs mx-auto mb-2">
      <a
        className={`tab ${selectedTab === 0 && "tab-active"}`}
        onClick={() => {
          setSelectedTab(0);
        }}
      >
        {t("TITLE")}
      </a>
      <a
        className={`tab ${selectedTab === 1 && "tab-active"}`}
        onClick={() => {
          setSelectedTab(1);
        }}
      >
        {t("SETTINGS.TITLE")}
      </a>
    </div>
  );
};

export default Tabs;
