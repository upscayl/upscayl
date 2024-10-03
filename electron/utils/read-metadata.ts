import logit from "@electron/utils/logit";
const exiftool = require("exiftool-vendored").exiftool;

const readMetadata = async (path: string) => {
  logit("🔍 Reading Metadata: ", path);
  return exiftool.read(path);
};

export default readMetadata;
