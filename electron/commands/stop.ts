import mainWindow from "../main-window";
import { getChildProcesses, setStop } from "../utils/config-variables";
import logit from "../utils/logit";

const stop = async (event, payload) => {
  setStop(true);
  mainWindow && mainWindow.setProgressBar(-1);
  getChildProcesses().forEach((child) => {
    logit("🛑 Stopping Upscaling Process", child.process.pid);
    child.kill();
  });
};

export default stop;
