/**
 * URL of a local picture for <img> and friends. The page has no access to file://, the main process serves
 * pictures through the upscayl-file scheme (see electron/utils/protocols.ts).
 * Expects a path that went through sanitizePath().
 */
export const localFileUrl = (sanitizedPath: string) =>
  "upscayl-file://" + (sanitizedPath.startsWith("/") ? "" : "/") + sanitizedPath;
