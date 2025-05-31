import { exiftool } from "exiftool-vendored";

export async function copyMetadata(originalFile: string, outputFile: string): Promise<void> {
  await exiftool.write(outputFile, {}, { writeArgs: ['-overwrite_original_in_place', '-tagsFromFile', originalFile] });
}
