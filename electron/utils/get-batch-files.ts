import fs from "fs";
import path from "path";
import { getPlatform } from "./get-device-specs";

const BATCH_IMAGE_EXTENSIONS = [
  "png",
  "jpg",
  "jpeg",
  "jfif",
  "webp",
] as const;

const slash = getPlatform() === "win" ? "\\" : "/";

/**
 * Recursively collects all image file paths under dirPath.
 * Returns paths relative to dirPath (using platform slash).
 */
export function getBatchImagePaths(dirPath: string): string[] {
  const results: string[] = [];
  const decodedDir = decodeURIComponent(dirPath);

  function walk(currentDir: string, relativePrefix: string) {
    if (!fs.existsSync(currentDir)) return;
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      const relativePath = relativePrefix
        ? relativePrefix + slash + entry.name
        : entry.name;
      if (entry.isDirectory()) {
        walk(fullPath, relativePath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase().slice(1);
        if (
          (BATCH_IMAGE_EXTENSIONS as readonly string[]).includes(ext)
        ) {
          results.push(relativePath);
        }
      }
    }
  }

  walk(decodedDir, "");
  return results;
}
