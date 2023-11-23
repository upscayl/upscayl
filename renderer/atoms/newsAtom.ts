import { atomWithStorage } from "jotai/utils";

export const newsAtom = atomWithStorage("news", {
  seen: false,
  version: null,
});
