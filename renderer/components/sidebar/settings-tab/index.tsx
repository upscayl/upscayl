import React from "react";
import { useAtom, useAtomValue } from "jotai";
import { showSettingsDialogAtom } from "@/atoms/toggle-settings";
import { settingsCategoryAtom } from "@/atoms/settings-category-atom";
import { translationAtom } from "@/atoms/translations-atom";
import { ImageFormat } from "@/lib/valid-formats";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import SettingsSidebar from "./settings-sidebar";
import AppearanceSection from "./sections/appearance-section";
import AIModelsSection from "./sections/ai-models-section";
import ImageSettingsSection from "./sections/image-settings-section";
import SystemSection from "./sections/system-section";
import LogsSection from "./sections/logs-section";
import HelpSection from "./sections/help-section";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface IProps {
  batchMode: boolean;
  saveImageAs: ImageFormat;
  setSaveImageAs: React.Dispatch<React.SetStateAction<ImageFormat>>;
  compression: number;
  setCompression: React.Dispatch<React.SetStateAction<number>>;
  gpuId: string;
  setGpuId: React.Dispatch<React.SetStateAction<string>>;
  logData: string[];
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  setDontShowCloudModal: React.Dispatch<React.SetStateAction<boolean>>;
}

function SettingsTab({
  batchMode,
  compression,
  setCompression,
  gpuId,
  setGpuId,
  saveImageAs,
  setSaveImageAs,
  logData,
  show,
  setShow,
  setDontShowCloudModal,
}: IProps) {
  const [showSettings, setShowSettings] = useAtom(showSettingsDialogAtom);
  const activeCategory = useAtomValue(settingsCategoryAtom);
  const t = useAtomValue(translationAtom);

  const renderSection = () => {
    switch (activeCategory) {
      case "appearance":
        return <AppearanceSection />;
      case "ai-models":
        return <AIModelsSection gpuId={gpuId} setGpuId={setGpuId} />;
      case "image-settings":
        return (
          <ImageSettingsSection
            batchMode={batchMode}
            saveImageAs={saveImageAs}
            setSaveImageAs={setSaveImageAs}
            compression={compression}
            setCompression={setCompression}
          />
        );
      case "system":
        return (
          <SystemSection
            show={show}
            setShow={setShow}
            setDontShowCloudModal={setDontShowCloudModal}
          />
        );
      case "logs":
        return <LogsSection logData={logData} />;
      case "help":
        return <HelpSection logData={logData} />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={showSettings} onOpenChange={setShowSettings}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-3xl md:max-h-125 lg:max-h-screen lg:max-w-3xl">
        <DialogHeader className="h-8 px-6 pt-5">
          <DialogTitle>{t("Settings")}</DialogTitle>
        </DialogHeader>
        <div className="flex h-100 overflow-hidden pr-2 pb-6 pl-4">
          <SettingsSidebar />
          <ScrollArea className="w-full overflow-x-hidden">
            <div className="px-2 pt-0.5 [&>div]:gap-2 [&>div>div]:py-2 [&>div>div]:pr-1.5 [&>div>div]:pl-3">
              {renderSection()}
            </div>
            <ScrollBar orientation="vertical" />
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SettingsTab;
