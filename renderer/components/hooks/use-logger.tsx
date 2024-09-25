import { logAtom } from "../../atoms/logAtom";
import log from "electron-log/renderer";
import { useSetAtom } from "jotai";
import React from "react";

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
