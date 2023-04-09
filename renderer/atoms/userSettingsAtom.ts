import { atomWithStorage } from "jotai/utils";

export const customModelsPathAtom = atomWithStorage<string | null>(
  "customModelsPath",
  null
);
