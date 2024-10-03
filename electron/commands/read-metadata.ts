import logit from "@electron/utils/logit";
const exiftool = require("exiftool-vendored").exiftool;

const readMetadata = async (event, payload) => {
  logit("🔍 Reading Metadata: ", payload);
  return exiftool.read(payload);
};

export default readMetadata;
