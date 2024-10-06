export default function getDirectoryFromPath(
  filePath: string,
  popFileName: boolean = true,
): string {
  // Define the path separator based on the operating system
  const separator = filePath.includes("/") ? "/" : "\\";

  // Split the file path by the path separator
  const pathParts = filePath.split(separator);

  // Remove the last element to get the directory if popFileName is true
  if (popFileName) pathParts.pop();

  // Join the remaining parts back together to form the directory path
  const directoryPath = pathParts.join(separator);

  return directoryPath || "";
}
