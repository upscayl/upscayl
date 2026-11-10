// Builds the Core ML engine from native/coreml into resources/mac/bin/upscayl-coreml.
//
// It does nothing outside macOS. Without a Swift toolchain it only prints a warning, and the app then runs
// everything with ncnn. A real compile error stops the build.
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

if (process.platform !== "darwin") process.exit(0);

const root = path.join(__dirname, "..");
const packageDir = path.join(root, "native", "coreml");
const output = path.join(root, "resources", "mac", "bin", "upscayl-coreml");

const newestModification = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).reduce((newest, entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return entry.name === ".build" ? newest : Math.max(newest, newestModification(full));
    }
    return Math.max(newest, fs.statSync(full).mtimeMs);
  }, 0);

if (fs.existsSync(output) && fs.statSync(output).mtimeMs > newestModification(packageDir)) {
  console.log("upscayl-coreml is up to date");
  process.exit(0);
}

try {
  execFileSync("swift", ["--version"], { stdio: "ignore" });
} catch {
  console.warn(
    "Swift was not found (install the Xcode command line tools). upscayl-coreml was not built, the app will use ncnn only.",
  );
  process.exit(0);
}

// the engine only runs on Apple Silicon, so there is no x86_64 build of it
const swiftBuild = (extra) =>
  execFileSync(
    "swift",
    ["build", "-c", "release", "--arch", "arm64", "--package-path", packageDir, ...extra],
    { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] },
  );

swiftBuild([]);
const binPath = swiftBuild(["--show-bin-path"]).trim();

fs.mkdirSync(path.dirname(output), { recursive: true });
fs.copyFileSync(path.join(binPath, "upscayl-coreml"), output);
fs.chmodSync(output, 0o755);
console.log("built", output);
