/**
 * Returns the filename without the extension.
 * @param filename The filename to remove the extension from.
 * @returns The filename without the extension.
 */
export default function removeFileExtension(filename: string): string {
  return filename.replace(/\.[^/.]+$/, "");
}
