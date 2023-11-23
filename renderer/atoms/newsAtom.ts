import { atomWithStorage } from "jotai/utils";

export const newsSeenAtom = atomWithStorage("newsSeen", false);
export const newsAtom = atomWithStorage("news", []);
