"use client";
import { useState } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  batchModeAtom,
  compressionAtom,
  dontShowCloudModalAtom,
  noImageProcessingAtom,
  savedOutputPathAtom,
  overwriteAtom,
  progressAtom,
  scaleAtom,
  customWidthAtom,
  useCustomWidthAtom,
  tileSizeAtom,
  showSidebarAtom,
  selectedModelIdAtom,
  doubleUpscaylAtom,
  gpuIdAtom,
  saveImageAsAtom,
  userStatsAtom,
  ttaModeAtom,
  copyMetadataAtom,
} from "../../atoms/user-settings-atom";
import useLogger from "../hooks/use-logger";
import {
  BatchUpscaylPayload,
  DoubleUpscaylPayload,
  ImageUpscaylPayload,
} from "@common/types/types";
import { toast } from "sonner";
import UpscaylSteps from "./upscayl-tab/upscayl-steps";
import SettingsTab from "./settings-tab";
import Footer from "../footer";
import { logAtom } from "@/atoms/log-atom";
import { ELECTRON_COMMANDS } from "@common/electron-commands";
import useTranslation from "../hooks/use-translation";

const Sidebar = ({
  setUpscaledImagePath,
  batchFolderPath,
  setUpscaledBatchFolderPath,
  dimensions,
  imagePath,
  selectImageHandler,
  selectFolderHandler,
  importDroppedPath,
}: {
  setUpscaledImagePath: React.Dispatch<React.SetStateAction<string>>;
  batchFolderPath: string;
  setUpscaledBatchFolderPath: React.Dispatch<React.SetStateAction<string>>;
  dimensions: {
    width: number | null;
    height: number | null;
  };
  imagePath: string;
  selectImageHandler: () => Promise<void>;
  selectFolderHandler: () => Promise<void>;
  importDroppedPath: (path: string) => Promise<void>;
}) => {
  const t = useTranslation();
  const logit = useLogger();

  // LOCAL STATES
  // TODO: Add electron handler for os
  const [selectedModelId, setSelectedModelId] = useAtom(selectedModelIdAtom);
  const [doubleUpscayl, setDoubleUpscayl] = useAtom(doubleUpscaylAtom);
  const [gpuId, setGpuId] = useAtom(gpuIdAtom);
  const [saveImageAs, setSaveImageAs] = useAtom(saveImageAsAtom);

  const [selectedTab, setSelectedTab] = useState(0);
  const [showCloudModal, setShowCloudModal] = useState(false);

  // ATOMIC STATES
  const overwrite = useAtomValue(overwriteAtom);
  const outputPath = useAtomValue(savedOutputPathAtom);
  const [compression, setCompression] = useAtom(compressionAtom);
  const setProgress = useSetAtom(progressAtom);
  const [batchMode, setBatchMode] = useAtom(batchModeAtom);
  const logData = useAtomValue(logAtom);
  const [scale] = useAtom(scaleAtom);
  const setDontShowCloudModal = useSetAtom(dontShowCloudModalAtom);
  const noImageProcessing = useAtomValue(noImageProcessingAtom);
  const customWidth = useAtomValue(customWidthAtom);
  const useCustomWidth = useAtomValue(useCustomWidthAtom);
  const tileSize = useAtomValue(tileSizeAtom);
  const [showSidebar, setShowSidebar] = useAtom(showSidebarAtom);
  const setUserStats = useSetAtom(userStatsAtom);
  const ttaMode = useAtomValue(ttaModeAtom);
  const [copyMetadata] = useAtom(copyMetadataAtom);

  const upscaylHandler = async () => {
    logit("🔄 Resetting Upscaled Image Path");
    setUpscaledImagePath("");
    setUpscaledBatchFolderPath("");
    if (imagePath !== "" || batchFolderPath !== "") {
      setProgress(t("Hold on..."));
      // Double Upscayl
      if (doubleUpscayl) {
        window.electron.send<DoubleUpscaylPayload>(
          ELECTRON_COMMANDS.DOUBLE_UPSCAYL,
          {
            imagePath,
            outputPath,
            model: selectedModelId,
            gpuId: gpuId.length === 0 ? null : gpuId,
            saveImageAs,
            scale,
            noImageProcessing,
            compression: compression.toString(),
            customWidth: customWidth > 0 ? customWidth.toString() : null,
            useCustomWidth,
            tileSize,
            ttaMode,
            copyMetadata,
          },
        );
        setUserStats((prev) => ({
          ...prev,
          totalUpscayls: prev.totalUpscayls + 1,
          lastUsedAt: new Date().getTime(),
          doubleUpscayls: prev.doubleUpscayls + 1,
          imageUpscayls: prev.imageUpscayls + 1,
        }));
        logit("🏁 DOUBLE_UPSCAYL");
      } else if (batchMode) {
        // Batch Upscayl
        setDoubleUpscayl(false);
        window.electron.send<BatchUpscaylPayload>(
          ELECTRON_COMMANDS.FOLDER_UPSCAYL,
          {
            batchFolderPath,
            outputPath,
            model: selectedModelId,
            gpuId: gpuId.length === 0 ? null : gpuId,
            saveImageAs,
            scale,
            noImageProcessing,
            compression: compression.toString(),
            customWidth: customWidth > 0 ? customWidth.toString() : null,
            useCustomWidth,
            tileSize,
            ttaMode,
            copyMetadata,
          },
        );
        setUserStats((prev) => ({
          ...prev,
          totalUpscayls: prev.totalUpscayls + 1,
          lastUsedAt: new Date().getTime(),
          batchUpscayls: prev.doubleUpscayls + 1,
        }));
        logit("🏁 FOLDER_UPSCAYL");
      } else {
        // Single Image Upscayl
        window.electron.send<ImageUpscaylPayload>(ELECTRON_COMMANDS.UPSCAYL, {
          imagePath,
          outputPath,
          model: selectedModelId,
          gpuId: gpuId.length === 0 ? null : gpuId,
          saveImageAs,
          scale,
          overwrite,
          noImageProcessing,
          compression: compression.toString(),
          customWidth: customWidth > 0 ? customWidth.toString() : null,
          useCustomWidth,
          tileSize,
          ttaMode,
          copyMetadata,
        });
        setUserStats((prev) => ({
          ...prev,
          totalUpscayls: prev.totalUpscayls + 1,
          lastUsedAt: new Date().getTime(),
          imageUpscayls: prev.imageUpscayls + 1,
        }));
        logit("🏁 UPSCAYL");
      }
    } else {
      toast(t("No image selected"), {
        description: t("Please select an image to upscale"),
      });
      logit("🚫 No valid image selected");
    }
  };

  return (
    <div className="relative flex min-w-xs flex-col overflow-hidden rounded-4xl border bg-secondary glass-panel">
      {selectedTab === 0 && (
        <UpscaylSteps
          selectImageHandler={selectImageHandler}
          selectFolderHandler={selectFolderHandler}
          importDroppedPath={importDroppedPath}
          imagePath={imagePath}
          upscaylHandler={upscaylHandler}
          batchMode={batchMode}
          setBatchMode={setBatchMode}
          doubleUpscayl={doubleUpscayl}
          setDoubleUpscayl={setDoubleUpscayl}
          dimensions={dimensions}
          setGpuId={setGpuId}
          setSaveImageAs={setSaveImageAs}
        />
      )}

      <SettingsTab
        batchMode={batchMode}
        compression={compression}
        setCompression={setCompression}
        gpuId={gpuId}
        setGpuId={setGpuId}
        saveImageAs={saveImageAs}
        setSaveImageAs={setSaveImageAs}
        logData={logData}
        show={showCloudModal}
        setShow={setShowCloudModal}
        setDontShowCloudModal={setDontShowCloudModal}
      />
      {/* <Footer /> */}
    </div>
  );
};

export default Sidebar;
