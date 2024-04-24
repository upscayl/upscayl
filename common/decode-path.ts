import path from "path";

export default function decodePath(filePath: string): string {
  return path.normalize(decodeURIComponent(filePath));
}
