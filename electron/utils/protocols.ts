import { app, net, protocol } from "electron";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

export const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".jfif", ".webp"]);

const forbidden = () => new Response("Forbidden", { status: 403 });

const pathnameOf = (requestUrl: string) =>
  decodeURIComponent(new URL(requestUrl).pathname);

// bypassCustomProtocolHandlers makes net.fetch read the file itself instead of asking our handlers again
const readFile = (filePath: string) =>
  net.fetch(pathToFileURL(filePath).toString(), {
    bypassCustomProtocolHandlers: true,
  });

// On Windows c:\app and C:\App are the same folder, and a file URL need not spell it the way the app path does.
const isInside = (filePath: string, folder: string) => {
  const [file, root] =
    process.platform === "win32"
      ? [filePath.toLowerCase(), folder.toLowerCase()]
      : [filePath, folder];
  return file.startsWith(root + path.sep);
};

/**
 * The page loads local files through two schemes of ours, never through file://.
 *
 * upscayl-file:///<encoded path> is for the images the user picked and the ones Upscayl made. Only image
 * files are served, the page can't read anything else off the disk.
 *
 * public:///<path> is for the static files of the app itself (renderer/public, out/renderer when packaged),
 * and a request can't leave that folder.
 *
 * file:// is still how the built window loads its own page, and Electron lets a page loaded from a file read
 * any other file:// URL (connect-src 'self' matches them all). So file:// is answered by us too, and only for
 * the files of the built page in out/renderer.
 */
export const registerProtocols = () => {
  const pageRoot = path.join(app.getAppPath(), "out", "renderer");

  protocol.handle("file", async (request) => {
    try {
      const filePath = path.resolve(fileURLToPath(request.url));
      if (!isInside(filePath, pageRoot)) return forbidden();
      return await readFile(filePath);
    } catch {
      return new Response("Bad request", { status: 400 });
    }
  });

  protocol.handle("upscayl-file", async (request) => {
    try {
      let filePath = pathnameOf(request.url);
      if (process.platform === "win32") {
        // upscayl-file:///C%3A/dir/x.png is C:/dir/x.png. A network path keeps its two slashes
        // (//server/share/x.png), otherwise it would be looked up on the current drive.
        filePath = filePath.startsWith("//")
          ? filePath
          : filePath.replace(/^\//, "");
      }
      if (!path.isAbsolute(filePath)) return forbidden();
      if (!IMAGE_EXTENSIONS.has(path.extname(filePath).toLowerCase())) {
        return forbidden();
      }
      return await readFile(filePath);
    } catch {
      return new Response("Bad request", { status: 400 });
    }
  });

  const publicRoot = app.isPackaged
    ? path.join(app.getAppPath(), "out", "renderer")
    : path.join(app.getAppPath(), "renderer", "public");

  protocol.handle("public", async (request) => {
    try {
      const filePath = path.resolve(publicRoot, "." + pathnameOf(request.url));
      if (!isInside(filePath, publicRoot)) return forbidden();
      return await readFile(filePath);
    } catch {
      return new Response("Bad request", { status: 400 });
    }
  });
};
