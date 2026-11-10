import { app, net, protocol } from "electron";
import path from "path";
import { pathToFileURL } from "url";

const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".jfif", ".webp"]);

const forbidden = () => new Response("Forbidden", { status: 403 });

const pathnameOf = (requestUrl: string) =>
  decodeURIComponent(new URL(requestUrl).pathname);

// bypassCustomProtocolHandlers makes net.fetch read the file itself instead of asking our handlers again
const readFile = (filePath: string) =>
  net.fetch(pathToFileURL(filePath).toString(), {
    bypassCustomProtocolHandlers: true,
  });

/**
 * The page loads local files through two schemes of ours, never through file://.
 *
 * upscayl-file:///<encoded path> is for the images the user picked and the ones Upscayl made. Only image
 * files are served, the page can't read anything else off the disk.
 *
 * public:///<path> is for the static files of the app itself (renderer/public, out/renderer when packaged),
 * and a request can't leave that folder.
 */
export const registerProtocols = () => {
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
      if (!filePath.startsWith(publicRoot + path.sep)) return forbidden();
      return await readFile(filePath);
    } catch {
      return new Response("Bad request", { status: 400 });
    }
  });
};
