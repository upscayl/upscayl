import React from "react";

type TabsProps = {
  selectedTab: number;
  setSelectedTab: (tab: number) => void;
};

const Tabs = ({ selectedTab, setSelectedTab }: TabsProps) => {
  return (
    <div className="tabs tabs-boxed mx-auto">
      <a
        className={`tab ${selectedTab === 0 && "tab-active"}`}
        onClick={() => {
          setSelectedTab(0);
        }}>
        Upscayl
      </a>
      <a
        className={`tab ${selectedTab === 1 && "tab-active"}`}
        onClick={() => {
          setSelectedTab(1);
        }}>
        Settings
      </a>
    </div>
  );
};

export default Tabs;
