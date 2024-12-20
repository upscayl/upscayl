import { logAtom } from "../../atoms/log-atom";
import log from "electron-log/renderer";
import { useSetAtom } from "jotai";

const useLogger = () => {
  const setLogData = useSetAtom(logAtom);

  const logit = (...args: any) => {
    log.log(...args);

    const data = [...args].join(" ");
    setLogData((prevLogData) => [...prevLogData, data]);
  };

  return logit;
};

export default useLogger;
