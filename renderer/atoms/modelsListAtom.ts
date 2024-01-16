import { defaultModelsList } from "@common/models-list";
import { atom } from "jotai";

export type TModelsList = {
  label: string;
  value: string;
}[];

export const modelsListAtom = atom<TModelsList>(defaultModelsList);
