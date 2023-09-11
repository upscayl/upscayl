import { getPlatform } from "./get-device-specs";

const slash: string = getPlatform() === "win" ? "\\" : "/";
export default slash;
