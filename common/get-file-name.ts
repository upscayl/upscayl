export default function getFilenameFromPath(path: string) {
  if (!path) return "";
  const separator = path.includes("/") ? "/" : "\\";
  return path.split(separator).slice(-1)[0];
}
