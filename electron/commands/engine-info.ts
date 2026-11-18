import { EngineInfo } from "../../common/types/types";
import { canTryCoreml } from "../utils/spawn-upscayl";

// The Core ML engine is only built for and shipped with Apple Silicon Macs, so the settings page
// asks before it shows the switch.
const engineInfo = async (): Promise<EngineInfo> => ({
  coreml: canTryCoreml([], "auto"),
});

export default engineInfo;
