import { atom } from "jotai";
import { ELECTRON_COMMANDS } from "@common/electron-commands";
import { DeleteHistoryTarget, HistoryEntry } from "@common/types/types";

export type HistoryItem = HistoryEntry;

const deleteHistoryEntry = (payload: DeleteHistoryTarget) => {
  window.electron.send(ELECTRON_COMMANDS.DELETE_HISTORY_ENTRY, payload);
};

export const historyAtom = atom<HistoryItem[]>([]);

export const loadHistoryItems = atom(null, (_, set) => {
  window.electron
    .invoke(ELECTRON_COMMANDS.GET_HISTORY_ENTRIES)
    .then((items: HistoryItem[]) => set(historyAtom, items));
});

const itemKey = (entry: HistoryEntry) =>
  entry.kind === "batch-upscayl" ? `batch:${entry.batchId}` : `run:${entry.id}`;

export const addHistoryItemsAtom = atom(
  null,
  (get, set, items: HistoryEntry[]) => {
    const existing = new Set(get(historyAtom).map((e) => itemKey(e)));
    const fresh = items.filter((e) => !existing.has(itemKey(e)));
    if (fresh.length === 0) return;
    set(historyAtom, [...fresh, ...get(historyAtom)]);
  },
);

export const addHistoryItemAtom = atom(null, (get, set, item: HistoryItem) => {
  set(historyAtom, [
    item,
    ...get(historyAtom).filter((entry) => entry.outputPath !== item.outputPath),
  ]);
});

export const removeHistoryItemAtom = atom(null, (get, set, id: number) => {
  const current = get(historyAtom);
  const item = current.find((entry) => entry.id === id);
  set(
    historyAtom,
    current.filter((entry) => entry.id !== id),
  );
  if (item) deleteHistoryEntry({ mode: "single", id: item.id });
});

export const clearHistoryAtom = atom(null, (_, set) => {
  set(historyAtom, []);
  deleteHistoryEntry({ mode: "all" });
});
