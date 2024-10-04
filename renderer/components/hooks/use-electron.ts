import { useEffect } from "react";
import { ELECTRON_COMMANDS } from "@common/electron-commands";

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
