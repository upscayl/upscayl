import { ELECTRON_COMMANDS } from "@common/electron-commands";
import { useEffect } from "react";
import useLogger from "./use-logger";

export const initCustomModels = () => {
  const logit = useLogger();

  useEffect(() => {
    const customModelsPath = JSON.parse(
      localStorage.getItem("customModelsPath"),
    );
    if (customModelsPath !== null) {
      window.electron.send(ELECTRON_COMMANDS.GET_MODELS_LIST, customModelsPath);
      logit("🎯 GET_MODELS_LIST: ", customModelsPath);
    }
  }, []);
};
