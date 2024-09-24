import ELECTRON_COMMANDS from "@common/commands";
import { useEffect } from "react";
import useLog from "./useLog";

export const initCustomModels = () => {
  const { logit } = useLog();

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
