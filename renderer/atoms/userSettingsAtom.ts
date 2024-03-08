import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export const customModelsPathAtom = atomWithStorage<string | null>(
  "customModelsPath",
  null,
);
export const scaleAtom = atomWithStorage<"2" | "3" | "4">("scale", "4");
export const batchModeAtom = atom<boolean>(false);
export const outputPathAtom = atomWithStorage<string | null>(
  "lastOutputFolderPath",
  null,
);
export const progressAtom = atom<string>("");

export const rememberOutputFolderAtom = atomWithStorage<boolean>(
  "rememberOutputFolder",
  false,
);

export const dontShowCloudModalAtom = atomWithStorage<boolean>(
  "dontShowCloudModal",
  false,
);

export const noImageProcessingAtom = atomWithStorage<boolean>(
  "noImageProcessing",
  false,
);

export const compressionAtom = atomWithStorage<number>("compression", 0);

export const overwriteAtom = atomWithStorage("overwrite", false);

export const turnOffNotificationsAtom = atomWithStorage(
  "turnOffNotifications",
  false,
);

export const viewTypeAtom = atomWithStorage<"slider" | "lens">(
  "viewType",
  "lens",
);

export const lensSizeAtom = atomWithStorage<number>("lensSize", 100);

export const customWidthAtom = atomWithStorage<number | null>(
  "customWidth",
  null,
);

export const useCustomWidthAtom = atomWithStorage<boolean>(
  "useCustomWidth",
  false,
);
