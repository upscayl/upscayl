import { useEffect } from "react";
import { useAtomValue } from "jotai";
import { translationAtom } from "@/atoms/translations-atom";
import ELECTRON_COMMANDS from "@common/commands";
import useLog from "./useLog";

const useElectron = ({
  command,
  func,
}: {
  command: (typeof ELECTRON_COMMANDS)[keyof typeof ELECTRON_COMMANDS];
  func: (...args: any[]) => void;
}) => {
  useEffect(() => {
    window.electron.on(command, func);
    return () => {
      window.electron.off(command, func);
    };
  }, []);
};
