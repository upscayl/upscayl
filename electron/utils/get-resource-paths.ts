import { statSync } from "node:fs";
import { join, dirname, resolve } from "path";
import { getPlatform } from "./get-device-specs";
import { app } from "electron";

/**
 * appRootDir is the resources directory inside the unpacked electron app temp directory.
 * resources contains app.asar file, that contains the main and renderer files.
 * We're putting resources/{os}/bin from project inside resources/bin of electron.
 * Same for the models directory as well.
 */
const appRootDir = app.getAppPath();

const binariesPath = app.isPackaged
  ? join(dirname(appRootDir), "bin")
  : join(appRootDir, "resources", getPlatform()!, "bin");

const execPath = resolve(join(binariesPath, "./upscayl-bin"));

// Core ML engine, built from native/coreml. Only macOS builds have it.
const coremlExecPath = resolve(join(binariesPath, "./upscayl-coreml"));

const modelsPath = app.isPackaged
  ? resolve(join(dirname(appRootDir), "models"))
  : resolve(join(appRootDir, "resources", "models"));

const withoutBgResourceRootCandidates = [
  ...(!app.isPackaged && process.env.WITHOUTBG_ROOT
    ? [resolve(process.env.WITHOUTBG_ROOT)]
    : []),
  app.isPackaged
    ? join(process.resourcesPath, "withoutbg")
    : join(appRootDir, "resources", "withoutbg"),
  ...(!app.isPackaged
    ? [resolve(appRootDir, "..", "unbackground", "withoutbg-mnn")]
    : []),
];

const withoutBgPlatform = `${process.platform}-${process.arch}`;
const withoutBgBinaryName =
  process.platform === "win32" ? "withoutbg-mnn.exe" : "withoutbg-mnn";

const withoutBgBinaryCandidates = withoutBgResourceRootCandidates.flatMap(
  (root) => [
    join(root, "native", withoutBgPlatform, withoutBgBinaryName),
    ...(process.platform === "darwin"
      ? [join(root, "native", "darwin-universal", withoutBgBinaryName)]
      : []),
    join(root, "bin", withoutBgBinaryName),
    join(root, withoutBgBinaryName),
    ...(process.platform === "darwin"
      ? [join(root, "build", "macos-universal", withoutBgBinaryName)]
      : []),
    join(root, "build", "native", withoutBgBinaryName),
    join(root, "build-make", "native", withoutBgBinaryName),
  ],
);

const withoutBgModelCandidates = withoutBgResourceRootCandidates.flatMap(
  (root) => [
    join(root, "models", "withoutbg.mnn"),
    join(root, "withoutbg.mnn"),
    join(root, "assets", "withoutbg.mnn"),
  ],
);

const firstExistingFileOrFirst = (candidates: string[]) =>
  candidates.find((candidate) => {
    try {
      return statSync(candidate).isFile();
    } catch {
      return false;
    }
  }) ?? candidates[0];

const withoutBgBinaryPath = firstExistingFileOrFirst(withoutBgBinaryCandidates);
const withoutBgModelPath = firstExistingFileOrFirst(withoutBgModelCandidates);

export {
  execPath,
  coremlExecPath,
  modelsPath,
  withoutBgBinaryPath,
  withoutBgModelPath,
  withoutBgBinaryCandidates,
  withoutBgModelCandidates,
};
