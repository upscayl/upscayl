import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { ELECTRON_COMMANDS } from "@common/electron-commands";
import { HistoryEntry } from "@common/types/types";

export type HistoryItem = HistoryEntry;

const deleteHistoryEntry = (item: HistoryItem) => {
  if (item.folderPath)
    window.electron.send(
      ELECTRON_COMMANDS.DELETE_HISTORY_ENTRY,
      item.folderPath,
    );
};

export const historyAtom = atomWithStorage<HistoryItem[]>(
  "upscayl-history",
  [],
);

export const addHistoryItemAtom = atom(null, (get, set, item: HistoryItem) => {
  set(historyAtom, [
    item,
    ...get(historyAtom).filter((entry) => entry.outputPath !== item.outputPath),
  ]);
});

export const removeHistoryItemAtom = atom(null, (get, set, id: string) => {
  const current = get(historyAtom);
  const item = current.find((entry) => entry.id === id);
  set(
    historyAtom,
    current.filter((entry) => entry.id !== id),
  );
  if (item) deleteHistoryEntry(item);
});

export const clearHistoryAtom = atom(null, (get, set) => {
  const current = get(historyAtom);
  set(historyAtom, []);
  current.forEach(deleteHistoryEntry);
});
