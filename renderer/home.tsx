"use client";
import { useState, useEffect, useRef } from "react";
import { ELECTRON_COMMANDS } from "@common/electron-commands";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { customModelIdsAtom } from "./atoms/models-list-atom";
import {
  batchModeAtom,
  savedOutputPathAtom,
  progressAtom,
  rememberOutputFolderAtom,
  userStatsAtom,
} from "./atoms/user-settings-atom";
import useLogger from "./components/hooks/use-logger";
import { toast } from "sonner";
import { ToastAction } from "@/components/ui/toast";
import UpscaylSVGLogo from "@/components/icons/upscayl-logo-svg";
import { translationAtom } from "@/atoms/translations-atom";
import getDirectoryFromPath from "@common/get-directory-from-path";
import { FEATURE_FLAGS } from "@common/feature-flags";
import { ImageFormat, VALID_IMAGE_FORMATS } from "@/lib/valid-formats";
import { initCustomModels } from "@/components/hooks/use-custom-models";
import { OnboardingDialog } from "@/components/onboarding/onboarding-dialog";
import useSystemInfo from "@/components/hooks/use-system-info";
import Sidenav from "./components/sidenav";
import type { AppTab } from "./components/sidenav";
import { cn } from "./lib/utils";
import Sidebar from "./components/sidebar";
import Header from "./components/header";
import useUpscaylVersion from "./components/hooks/use-upscayl-version";
import MainContent from "./components/main-content";
import RemoveBackground from "./components/remove-background";

const Home = () => {
  const t = useAtomValue(translationAtom);
  const logit = useLogger();
  const { systemInfo } = useSystemInfo();
  const version = useUpscaylVersion();

  initCustomModels();

  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AppTab>("home");
  const [imagePath, setImagePath] = useState("");
  const [upscaledImagePath, setUpscaledImagePath] = useState("");
  const [dimensions, setDimensions] = useState({
    width: null,
    height: null,
  });
  const setOutputPath = useSetAtom(savedOutputPathAtom);
  const rememberOutputFolder = useAtomValue(rememberOutputFolderAtom);
  const [batchMode, setBatchMode] = useAtom(batchModeAtom);
  const [batchFolderPath, setBatchFolderPath] = useState("");
  const [upscaledBatchFolderPath, setUpscaledBatchFolderPath] = useState("");
  const setProgress = useSetAtom(progressAtom);
  const [doubleUpscaylCounter, setDoubleUpscaylCounter] = useState(0);
  const setModelIds = useSetAtom(customModelIdsAtom);
  const setUserStats = useSetAtom(userStatsAtom);

  const selectImageHandler = async () => {
    resetImagePaths();
    const path = await window.electron.invoke(ELECTRON_COMMANDS.SELECT_FILE);
    if (path === null) return;
    logit("🖼 Selected Image Path: ", path);
    setImagePath(path);
    const dirname = getDirectoryFromPath(path);
    logit("📁 Selected Image Directory: ", dirname);
    if (!FEATURE_FLAGS.APP_STORE_BUILD) {
      if (!rememberOutputFolder) {
        setOutputPath(dirname);
      }
    }
    validateImagePath(path);
    setBatchMode(false);
  };

  const selectFolderHandler = async () => {
    resetImagePaths();
    const path = await window.electron.invoke(ELECTRON_COMMANDS.SELECT_FOLDER);
    if (path !== null) {
      logit("🖼 Selected Folder Path: ", path);
      setBatchFolderPath(path);
      if (!rememberOutputFolder) {
        setOutputPath(path);
      }
      setBatchMode(true);
    } else {
      logit("🚫 Folder selection cancelled");
      setBatchFolderPath("");
      if (!rememberOutputFolder) {
        setOutputPath("");
      }
      setBatchMode(false);
    }
  };

  const importDroppedPath = async (path: string) => {
    const pathType = await window.electron.invoke(
      ELECTRON_COMMANDS.GET_DROPPED_PATH_TYPE,
      path,
    );

    if (pathType === "directory") {
      resetImagePaths();
      logit("📁 Dropped Folder Path: ", path);
      setBatchFolderPath(path);
      if (!rememberOutputFolder) setOutputPath(path);
      setBatchMode(true);
      return;
    }

    if (pathType === "file") {
      resetImagePaths();
      logit("🖼 Dropped Image Path: ", path);
      setImagePath(path);
      const dirname = getDirectoryFromPath(path);
      if (!FEATURE_FLAGS.APP_STORE_BUILD && !rememberOutputFolder) {
        setOutputPath(dirname);
      }
      validateImagePath(path);
      setBatchMode(false);
      return;
    }

    toast(t("Invalid Image"), {
      description: t("Please drag and drop an image"),
    });
  };

  const validateImagePath = (path: string) => {
    if (path.length > 0) {
      logit("🖼 imagePath: ", path);
      const extension = path.split(".").pop().toLowerCase() as ImageFormat;
      logit("🔤 Extension: ", extension);
      if (!VALID_IMAGE_FORMATS.includes(extension)) {
        toast(t("Invalid Image"), {
          description: t(
            "Please select/paste an image with a valid extension like PNG, JPG, JPEG, JFIF or WEBP.",
          ),
        });
        resetImagePaths();
      }
    } else {
      resetImagePaths();
    }
  };

  // ELECTRON EVENT LISTENERS
  useEffect(() => {
    const handleErrors = (data: string) => {
      if (data.includes("Invalid GPU")) {
        toast(t("GPU Error"), {
          description: t(
            "Ran into an issue with the GPU. Please read the docs for troubleshooting! ({data})",
            { data },
          ),
          action: (
            <div className="flex flex-col gap-2">
              <ToastAction
                altText={t("Copy Error")}
                onClick={() => {
                  navigator.clipboard.writeText(data);
                }}
              >
                {t("Copy Error")}
              </ToastAction>
              <a href="https://docs.upscayl.org/" target="_blank">
                <ToastAction altText={t("Open Docs")}>
                  {t("Troubleshoot")}
                </ToastAction>
              </a>
            </div>
          ),
        });
        resetImagePaths();
      } else if (data.includes("write") || data.includes("read")) {
        if (batchMode) return;
        toast(t("Read/Write Error"), {
          description: t(
            "Make sure that the path is correct and you have proper read/write permissions \n({data})",
            { data },
          ),
          action: (
            <div className="flex flex-col gap-2">
              <ToastAction
                altText="Copy Error"
                onClick={() => {
                  navigator.clipboard.writeText(data);
                }}
              >
                {t("Copy Error")}
              </ToastAction>
              <a href="https://docs.upscayl.org/" target="_blank">
                <ToastAction altText={t("Open Docs")}>
                  {t("Troubleshoot")}
                </ToastAction>
              </a>
            </div>
          ),
        });
        resetImagePaths();
      } else if (data.includes("tile size")) {
        toast(t("Tile Size Error"), {
          description: t(
            "The tile size is wrong. Please change the tile size in the settings or set to 0 ({data})",
            { data },
          ),
        });
        resetImagePaths();
      } else if (data.includes("uncaughtException")) {
        toast(t("Exception Error"), {
          description: t(
            "Upscayl encountered an error. Possibly, the upscayl binary failed to execute the commands properly. Try checking the logs to see if you get any information. You can post an issue on Upscayl's GitHub repository for more help.",
          ),
        });
        resetImagePaths();
      }
    };
    // LOG
    window.electron.on(ELECTRON_COMMANDS.LOG, (_, data: string) => {
      logit(`🎒 BACKEND REPORTED: `, data);
    });
    // SCALING AND CONVERTING
    window.electron.on(
      ELECTRON_COMMANDS.SCALING_AND_CONVERTING,
      (_, data: string) => {
        setProgress(t("Processing the image..."));
      },
    );
    // UPSCAYL WARNING
    window.electron.on(ELECTRON_COMMANDS.UPSCAYL_WARNING, (_, data: string) => {
      toast(t("Warning"), { description: data });
    });
    // METADATA ERROR
    window.electron.on(ELECTRON_COMMANDS.METADATA_ERROR, (_, data: string) => {
      toast(t("Metadata Copy Error"), { description: data });
    });
    // UPSCAYL ERROR
    window.electron.on(ELECTRON_COMMANDS.UPSCAYL_ERROR, (_, data: string) => {
      toast(t("Error"), { description: data });
      resetImagePaths();
    });
    // UPSCAYL PROGRESS
    window.electron.on(
      ELECTRON_COMMANDS.UPSCAYL_PROGRESS,
      (_, data: string) => {
        if (data.length > 0 && data.length < 10) {
          setProgress(data);
        } else if (data.includes("converting")) {
          setProgress(t("Scaling and converting image..."));
        } else if (data.includes("Successful")) {
          setProgress(t("Upscayl Successful!"));
        }
        handleErrors(data);
        logit(`🚧 UPSCAYL_PROGRESS: `, data);
      },
    );
    // FOLDER UPSCAYL PROGRESS
    window.electron.on(
      ELECTRON_COMMANDS.FOLDER_UPSCAYL_PROGRESS,
      (_, data: string) => {
        if (data.includes("Successful")) {
          setProgress(t("Upscayl Successful!"));
        }
        if (data.length > 0 && data.length < 10) {
          setProgress(data);
        }
        handleErrors(data);
        logit(`🚧 FOLDER_UPSCAYL_PROGRESS: `, data);
      },
    );
    // DOUBLE UPSCAYL PROGRESS
    window.electron.on(
      ELECTRON_COMMANDS.DOUBLE_UPSCAYL_PROGRESS,
      (_, data: string) => {
        if (data.length > 0 && data.length < 10) {
          if (data === "0.00%") {
            setDoubleUpscaylCounter(doubleUpscaylCounter + 1);
          }
          setProgress(data);
        }
        handleErrors(data);
        logit(`🚧 DOUBLE_UPSCAYL_PROGRESS: `, data);
      },
    );
    // UPSCAYL DONE
    window.electron.on(ELECTRON_COMMANDS.UPSCAYL_DONE, (_, data: string) => {
      setProgress("");
      setUpscaledImagePath(data);
      setUserStats((prev) => ({
        ...prev,
        lastUpscaylDuration: new Date().getTime() - prev.lastUsedAt,
        averageUpscaylTime:
          (prev.averageUpscaylTime * prev.totalUpscayls +
            (new Date().getTime() - prev.lastUsedAt)) /
          (prev.totalUpscayls + 1),
      }));
      logit("upscaledImagePath: ", data);
      logit(`💯 UPSCAYL_DONE: `, data);
    });
    // FOLDER UPSCAYL DONE
    window.electron.on(
      ELECTRON_COMMANDS.FOLDER_UPSCAYL_DONE,
      (_, data: string) => {
        setProgress("");
        setUpscaledBatchFolderPath(data);
        logit(`💯 FOLDER_UPSCAYL_DONE: `, data);
        setUserStats((prev) => ({
          ...prev,
          lastUpscaylDuration: new Date().getTime() - prev.lastUsedAt,
          averageUpscaylTime:
            (prev.averageUpscaylTime * prev.totalUpscayls +
              (new Date().getTime() - prev.lastUsedAt)) /
            (prev.totalUpscayls + 1),
        }));
      },
    );
    // DOUBLE UPSCAYL DONE
    window.electron.on(
      ELECTRON_COMMANDS.DOUBLE_UPSCAYL_DONE,
      (_, data: string) => {
        setProgress("");
        setTimeout(() => setUpscaledImagePath(data), 500);
        setDoubleUpscaylCounter(0);
        logit(`💯 DOUBLE_UPSCAYL_DONE: `, data);
        setUserStats((prev) => ({
          ...prev,
          lastUpscaylDuration: new Date().getTime() - prev.lastUsedAt,
          averageUpscaylTime:
            (prev.averageUpscaylTime * prev.totalUpscayls +
              (new Date().getTime() - prev.lastUsedAt)) /
            (prev.totalUpscayls + 1),
        }));
      },
    );
    // CUSTOM FOLDER LISTENER
    window.electron.on(
      ELECTRON_COMMANDS.CUSTOM_MODEL_FILES_LIST,
      (_, data: string[]) => {
        logit(`📜 CUSTOM_MODEL_FILES_LIST: `, data);
        console.log("🚀 => data:", data);
        setModelIds(data);
      },
    );
  }, []);

  // LOADING STATE
  useEffect(() => {
    setIsLoading(false);
  }, []);

  // SYSTEM INFO
  useEffect(() => {
    if (systemInfo) logit("💻 System Info:", JSON.stringify(systemInfo));
  }, [systemInfo]);

  // HANDLERS
  const resetImagePaths = () => {
    logit("🔄 Resetting image paths");
    setDimensions({
      width: null,
      height: null,
    });
    setProgress("");
    setImagePath("");
    setUpscaledImagePath("");
    setBatchFolderPath("");
    setUpscaledBatchFolderPath("");
  };

  if (isLoading) {
    return (
      <UpscaylSVGLogo className="absolute top-1/2 left-1/2 w-36 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
    );
  }

  const isMac = window.electron.platform === "mac";

  return (
    <div className={cn("flex h-screen w-screen flex-col overflow-hidden p-2")}>
      <div className={cn({ "pl-22": isMac })}>
        <Header version={version} />
      </div>
      <div className="flex size-full min-h-0 flex-row">
        <Sidenav activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="size-full min-h-0 p-2">
          <div
            className={cn(
              "flex size-full gap-2",
              activeTab !== "home" && "hidden",
            )}
          >
            <Sidebar
              imagePath={imagePath}
              dimensions={dimensions}
              setUpscaledImagePath={setUpscaledImagePath}
              batchFolderPath={batchFolderPath}
              setUpscaledBatchFolderPath={setUpscaledBatchFolderPath}
              selectImageHandler={selectImageHandler}
              selectFolderHandler={selectFolderHandler}
              importDroppedPath={importDroppedPath}
            />

            <MainContent
              imagePath={imagePath}
              resetImagePaths={resetImagePaths}
              upscaledBatchFolderPath={upscaledBatchFolderPath}
              setUpscaledBatchFolderPath={setUpscaledBatchFolderPath}
              setImagePath={setImagePath}
              validateImagePath={validateImagePath}
              selectFolderHandler={selectFolderHandler}
              selectImageHandler={selectImageHandler}
              importDroppedPath={importDroppedPath}
              batchFolderPath={batchFolderPath}
              setBatchFolderPath={setBatchFolderPath}
              upscaledImagePath={upscaledImagePath}
              doubleUpscaylCounter={doubleUpscaylCounter}
              setDimensions={setDimensions}
              dimensions={dimensions}
            />
          </div>
          <div
            className={cn(
              "size-full",
              activeTab !== "remove-background" && "hidden",
            )}
          >
            <RemoveBackground />
          </div>
        </div>
        {activeTab === "home" && <OnboardingDialog />}
      </div>
    </div>
  );
};

export default Home;
