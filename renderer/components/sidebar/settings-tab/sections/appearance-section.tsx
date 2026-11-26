import React from "react";
import SelectTheme from "../select-theme";
import LanguageSwitcher from "../language-switcher";
import ReduceAnimationsToggle from "../reduce-animations-toggle";

function AppearanceSection() {
  return (
    <div className="flex flex-col gap-5">
      <div data-setting="language">
        <LanguageSwitcher />
      </div>
      <div data-setting="reduce-animations">
        <ReduceAnimationsToggle />
      </div>
      <div data-setting="theme">
        <SelectTheme />
      </div>
    </div>
  );
}

export default AppearanceSection;
