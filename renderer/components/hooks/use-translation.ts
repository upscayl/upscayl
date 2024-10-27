import { translationAtom } from "@/atoms/translations-atom";
import { useAtomValue } from "jotai";

const useTranslation = () => {
  const t = useAtomValue(translationAtom);
  return t;
};

export default useTranslation;
