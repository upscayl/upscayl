import path from "path";

// The only folder the page can have opened in the file manager: the one the last batch wrote into, which the main
// process announces itself. A path from the page is not enough: a macOS app is a folder too, and opening it starts it.
let openable: string | undefined;

export const allowOpeningFolder = (folder: string) => {
  openable = path.normalize(folder);
};

export const isOpenableFolder = (folder: unknown): folder is string =>
  typeof folder === "string" &&
  openable !== undefined &&
  path.normalize(folder) === openable;
