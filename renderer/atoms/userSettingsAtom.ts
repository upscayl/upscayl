import { atomWithStorage } from "jotai/utils";

export const customModelsPathAtom = atomWithStorage<string | null>(
  "customModelsPath",
  null
);

export const scaleAtom = atomWithStorage<number>("scale", 4);
