import { atom } from "jotai";

export type TModelsList = {
  label: string;
  value: string;
}[];

export const defaultModelsList = [
  { label: "General Photo (Real-ESRGAN)", value: "realesrgan-x4plus" },
  {
    label: "General Photo (Fast Real-ESRGAN)",
    value: "RealESRGAN_General_x4_v3",
  },
  { label: "General Photo (Remacri)", value: "remacri" },
  { label: "General Photo (Ultramix Balanced)", value: "ultramix_balanced" },
  { label: "General Photo (Ultrasharp)", value: "ultrasharp" },
  { label: "Digital Art", value: "realesrgan-x4plus-anime" },
];

export const modelsListAtom = atom<TModelsList>(defaultModelsList);
