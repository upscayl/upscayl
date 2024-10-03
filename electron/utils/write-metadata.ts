import { ExifTool } from "exiftool-vendored";
import logit from "../utils/logit";

const writeMetadata = async (
  outPath: string,
  metadata: Record<string, any>,
  exiftool: ExifTool,
) => {
  logit("🖊️ Writing Metadata to path: ", outPath);
  const metadataCopy = { ...metadata };

  if (metadataCopy.hasOwnProperty("FileName")) delete metadataCopy.FileName;
  if (metadataCopy.hasOwnProperty("SourceFile")) {
    metadataCopy.SourceFile = outPath;
  }

  await exiftool.write(outPath, metadataCopy, {
    writeArgs: ["-overwrite_original"],
  });
};

export default writeMetadata;
