export function sanitizePath(filePath: string) {
  // const protocolPrefix = "file://";

  // Normalize the file path to use forward slashes (for Windows)
  const normalizedFilePath = filePath.replace(/\\/g, "/");

  // Split the file path into segments based on forward slashes
  const pathSegments = normalizedFilePath.split("/");

  // Encode each segment separately using encodeURIComponent
  const encodedPathSegments = pathSegments.map((segment) =>
    encodeURIComponent(segment),
  );

  // Join the encoded segments back together with forward slashes
  const encodedFilePath = encodedPathSegments.join("/");

  // Combine the protocol prefix with the encoded file path to create the final file URL
  const fileUrl = encodedFilePath;

  // Return the final Electron file URL
  return fileUrl;
}
