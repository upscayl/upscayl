import { GrayMatterFile } from "gray-matter";
import { atomWithStorage } from "jotai/utils";

export const showNewsModalAtom = atomWithStorage("showNewsModal", false);
export const newsAtom = atomWithStorage<GrayMatterFile<string>>("news", null);
