export default function getFilenameFromPath(
  path: string,
  withExtension: boolean = true,
) {
  if (!path) return "";
  if (withExtension) return path.split("/").slice(-1)[0];
  return path.split("/").slice(-1)[0].split(".").slice(0, -1).join(".");
}
