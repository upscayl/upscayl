import fs from "fs";
import path from "path";
import { isBundledModel } from "../../common/models-list";
import decodePath from "../../common/decode-path";
import { savedCustomModelsPath } from "./config-variables";
import { modelsPath } from "./get-resource-paths";
import { IMAGE_EXTENSIONS } from "./protocols";

const OUTPUT_FORMATS = new Set(["png", "jpg", "jpeg", "webp"]);

const decode = (value: unknown) => {
  try {
    return decodePath(String(value ?? ""));
  } catch {
    return "";
  }
};

const statOf = (target: string) => {
  try {
    return fs.statSync(target);
  } catch {
    return null;
  }
};

const isDirectory = (target: unknown): target is string =>
  typeof target === "string" &&
  path.isAbsolute(target) &&
  !!statOf(target)?.isDirectory();

const isImageFile = (target: unknown): target is string =>
  typeof target === "string" &&
  path.isAbsolute(target) &&
  IMAGE_EXTENSIONS.has(path.extname(target).toLowerCase()) &&
  !!statOf(target)?.isFile();

// the tile size and the GPU id are empty (null) until the user sets them
const isUnset = (value: unknown) =>
  value === null || value === undefined || value === "";

const isNumberBetween = (value: unknown, min: number, max: number) => {
  const number = typeof value === "string" ? Number(value) : value;
  return (
    typeof number === "number" &&
    Number.isFinite(number) &&
    number >= min &&
    number <= max
  );
};

/** A model is a bundled one, or a pair of files in the custom models folder. The name never has a path in it. */
const isKnownModel = (model: unknown) => {
  if (typeof model !== "string" || model === "" || model.length > 128) return false;
  if (isBundledModel(model)) return true;
  if (/[\\/\0]/.test(model) || model === "." || model === "..") return false;
  const folder = savedCustomModelsPath ?? modelsPath;
  return (
    fs.existsSync(path.join(folder, `${model}.param`)) &&
    fs.existsSync(path.join(folder, `${model}.bin`))
  );
};

/**
 * What the page asks for goes into the command line of the engine and into the name of the file it writes, so
 * the page is not trusted with it: a page that was taken over must not be able to write anywhere or pass
 * something odd on. Returns the first thing that is wrong, or null when the request is fine.
 */
export const checkUpscalePayload = (
  payload: any,
  kind: "image" | "folder",
): string | null => {
  if (!payload || typeof payload !== "object") return "no request";

  if (kind === "folder") {
    if (!isDirectory(decode(payload.batchFolderPath)))
      return "the folder to upscale does not exist";
  } else if (!isImageFile(decode(payload.imagePath))) {
    return "the picture to upscale is not an image that exists";
  }
  if (!isDirectory(decode(payload.outputPath)))
    return "the output folder does not exist";

  if (!isKnownModel(payload.model)) return "unknown model";
  if (!OUTPUT_FORMATS.has(payload.saveImageAs)) return "unsupported output format";
  if (!isNumberBetween(payload.scale, 1, 64)) return "wrong scale";
  if (!isNumberBetween(payload.compression, 0, 100)) return "wrong compression";
  if (!isUnset(payload.tileSize) && !isNumberBetween(payload.tileSize, 0, 8192))
    return "wrong tile size";
  if (
    payload.useCustomWidth &&
    !isNumberBetween(payload.customWidth, 1, 65535)
  )
    return "wrong width";
  if (
    !isUnset(payload.gpuId) &&
    (typeof payload.gpuId !== "string" || !/^[0-9,:-]{0,32}$/.test(payload.gpuId))
  )
    return "wrong GPU id";

  for (const flag of ["overwrite", "ttaMode", "useCustomWidth", "copyMetadata"]) {
    if (payload[flag] !== undefined && typeof payload[flag] !== "boolean")
      return `${flag} must be true or false`;
  }
  if (payload.engine !== undefined && !["auto", "ncnn"].includes(payload.engine))
    return "unknown engine";

  return null;
};
