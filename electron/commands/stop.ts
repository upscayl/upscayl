import { getMainWindow } from "../main-window";
import { childProcesses, setStopped } from "../utils/config-variables";
import logit from "../utils/logit";

const mainWindow = getMainWindow();

const stop = async (event, payload) => {
  setStopped(true);
  mainWindow && mainWindow.setProgressBar(-1);
  childProcesses.forEach((child) => {
    logit("🛑 Stopping Upscaling Process", child.process.pid);
    child.kill();
  });
};

export default stop;
