import { app, dialog } from "electron";
import { copyFile, mkdir, rm, stat } from "node:fs/promises";
import { homedir } from "node:os";
import { randomUUID } from "node:crypto";
import { extname, isAbsolute, join, relative, resolve } from "node:path";
import { ELECTRON_COMMANDS } from "../../common/electron-commands";
import {
  ExportRemoveBackgroundPayload,
  RemoveBackgroundDone,
  RemoveBackgroundError,
  RemoveBackgroundPayload,
} from "../../common/types/types";
import { getMainWindow } from "../main-window";
import {
  withoutBgBinaryPath,
  withoutBgModelPath,
} from "../utils/get-resource-paths";
import { removeBackground } from "../utils/remove-background";
import logit from "../utils/logit";

let activeJob: ReturnType<typeof removeBackground> | null = null;
let activeOutputPath = "";


const getRemoveBackgroundDir = () => {
  const xdgDataHome = process.env.XDG_DATA_HOME;
  const base =
    process.platform === "linux"
      ? join(
          // XDG spec: ignore relative paths.
          xdgDataHome && isAbsolute(xdgDataHome)
            ? xdgDataHome
            : join(homedir(), ".local", "share"),
          "upscayl",
        )
      : app.getPath("userData");
  return resolve(base, "remove-background");
};

const isRemoveBackgroundOutput = (filePath: string) => {
  const rel = relative(getRemoveBackgroundDir(), resolve(filePath));
  return (
    rel.length > 0 &&
    !rel.startsWith("..") &&
    !isAbsolute(rel) &&
    !rel.includes("/") &&
    !rel.includes("\\")
  );
};

const send = (command: string, payload: unknown) => {
  getMainWindow()?.webContents.send(command, payload);
};

const sendError = (message: string) => {
  const payload: RemoveBackgroundError = { message };
  send(ELECTRON_COMMANDS.REMOVE_BACKGROUND_ERROR, payload);
};

const isSupportedImagePath = (value: string) =>
  [".png", ".jpg", ".jpeg", ".jfif", ".webp"].includes(
    extname(value).toLowerCase(),
  );

const removeBackgroundCommand = async (
  _event: Electron.IpcMainEvent,
  payload: RemoveBackgroundPayload,
) => {
  if (activeJob) {
    sendError("Another background removal is already in progress.");
    return;
  }

  if (!payload || typeof payload.inputPath !== "string") {
    sendError("Choose an image before removing its background.");
    return;
  }

  const inputPath = resolve(payload.inputPath);
  if (!isSupportedImagePath(inputPath)) {
    sendError(
      "This image format is not supported. Choose a PNG, JPG, JPEG, JFIF, or WEBP image.",
    );
    return;
  }

  try {
    const inputStats = await stat(inputPath);
    if (!inputStats.isFile()) {
      sendError("The selected image is not a file.");
      return;
    }
  } catch {
    sendError(
      "The selected image could not be read. Check that it still exists and try again.",
    );
    return;
  }

  try {
    const binaryStats = await stat(withoutBgBinaryPath);
    const modelStats = await stat(withoutBgModelPath);
    if (!binaryStats.isFile() || !modelStats.isFile()) {
      throw new Error("WithoutBG resources are incomplete");
    }
  } catch {
    sendError(
      "The local background-removal engine is not installed yet. Build or stage the WithoutBG MNN binary and model, then restart Upscayl.",
    );
    return;
  }

  const outputDir = getRemoveBackgroundDir();
  try {
    await mkdir(outputDir, { recursive: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logit("❌ Remove Background: cannot create output folder: ", message);
    sendError(`Could not create the output folder: ${outputDir}`);
    return;
  }
  const outputPath = join(
    outputDir,
    `upscayl-without-background-${randomUUID()}.png`,
  );

  try {
    const job = removeBackground(
      { inputPath, outputPath },
      {
        binaryPath: withoutBgBinaryPath,
        modelPath: withoutBgModelPath,
        onProgress: (stage) => {
          send(ELECTRON_COMMANDS.REMOVE_BACKGROUND_PROGRESS, { stage });
        },
      },
    );

    activeJob = job;
    activeOutputPath = outputPath;
    logit("🪄 Remove Background: ", {
      inputPath,
      outputPath,
      binaryPath: withoutBgBinaryPath,
      modelPath: withoutBgModelPath,
    });

    job.promise
      .then((result) => {
        const payload: RemoveBackgroundDone = result;
        send(ELECTRON_COMMANDS.REMOVE_BACKGROUND_DONE, payload);
      })
      .catch((error: unknown) => {
        if (
          error instanceof Error &&
          error.message === "Background removal was cancelled"
        ) {
          sendError("Background removal was cancelled.");
          return;
        }
        const message = error instanceof Error ? error.message : String(error);
        logit("❌ Remove Background Error: ", message);
        sendError(message);
        void rm(outputPath, { force: true });
      })
      .finally(() => {
        activeJob = null;
        activeOutputPath = "";
      });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    sendError(message);
    await rm(outputPath, { force: true });
  }
};

export const stopRemoveBackground = () => {
  if (!activeJob) return;
  activeJob.cancel();
  if (activeOutputPath) void rm(activeOutputPath, { force: true });
};

export const exportRemoveBackground = async (
  _event: Electron.IpcMainInvokeEvent,
  payload: ExportRemoveBackgroundPayload,
) => {
  if (!payload || typeof payload.sourcePath !== "string") {
    throw new Error("There is no background-removed image to export.");
  }

  const sourcePath = resolve(payload.sourcePath);
  if (
    !isRemoveBackgroundOutput(sourcePath) ||
    !(await stat(sourcePath).then(
      (s) => s.isFile(),
      () => false,
    ))
  ) {
    throw new Error(
      "This generated image is no longer available. Process the image again.",
    );
  }

  const mainWindow = getMainWindow();
  const defaultName =
    typeof payload.defaultName === "string" && payload.defaultName.length > 0
      ? payload.defaultName.replace(/\.[^/.]+$/, "") + "-no-background.png"
      : "image-no-background.png";
  const saveOptions = {
    title: "Export image",
    defaultPath: join(app.getPath("downloads"), defaultName),
    filters: [{ name: "PNG image", extensions: ["png"] }],
    showOverwriteConfirmation: true,
  };
  const result = mainWindow
    ? await dialog.showSaveDialog(mainWindow, saveOptions)
    : await dialog.showSaveDialog(saveOptions);

  if (result.canceled || !result.filePath) return null;

  const targetPath =
    extname(result.filePath).toLowerCase() === ".png"
      ? result.filePath
      : `${result.filePath}.png`;
  await copyFile(sourcePath, targetPath);
  return targetPath;
};

export default removeBackgroundCommand;
