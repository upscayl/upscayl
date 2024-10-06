import { cn } from "@/lib/utils";
import { ChevronRightIcon } from "lucide-react";
import React from "react";

const SidebarToggleButton = ({
  showSidebar,
  setShowSidebar,
}: {
  showSidebar: boolean;
  setShowSidebar: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  return (
    <button
      className={cn(
        "fixed left-0 top-1/2 z-50 -translate-y-1/2 rounded-r-full bg-base-100 p-4 ",
        showSidebar ? "hidden" : "",
      )}
      onClick={() => setShowSidebar((prev) => !prev)}
    >
      <ChevronRightIcon />
    </button>
  );
};

export default SidebarToggleButton;
