import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export const customModelsPathAtom = atomWithStorage<string | null>(
  "customModelsPath",
  null
);
export const scaleAtom = atomWithStorage<"2" | "3" | "4">("scale", "4");
export const batchModeAtom = atom<boolean>(false);
export const outputPathAtom = atom<string | null>("");
export const progressAtom = atom<string>("");

export const rememberOutputFolderAtom = atomWithStorage<boolean>(
  "rememberOutputFolder",
  false
);

export const dontShowCloudModalAtom = atomWithStorage<boolean>(
  "dontShowCloudModal",
  false
);

export const noImageProcessingAtom = atomWithStorage<boolean>(
  "noImageProcessing",
  false
);

export const compressionAtom = atomWithStorage<number>("compression", 0);
