// Builds the Core ML engine from native/coreml into resources/mac/bin/upscayl-coreml.
//
// It does nothing outside macOS. Without a Swift toolchain it only prints a warning: the app keeps using the
// upscayl-coreml that is already there, or ncnn when there is none. A real compile error stops the build.
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

if (process.platform !== "darwin") process.exit(0);

const root = path.join(__dirname, "..");
const packageDir = path.join(root, "native", "coreml");
const output = path.join(root, "resources", "mac", "bin", "upscayl-coreml");

try {
  execFileSync("swift", ["--version"], { stdio: "ignore" });
} catch {
  console.warn(
    "Swift was not found (install the Xcode command line tools), so upscayl-coreml was not built.",
  );
  console.warn(
    fs.existsSync(output)
      ? "The upscayl-coreml that is already there stays in use, it may be out of date."
      : "The app will use ncnn only.",
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

// SwiftPM knows what changed (and what was deleted), and does nothing when it is all up to date
swiftBuild([]);
const built = path.join(swiftBuild(["--show-bin-path"]).trim(), "upscayl-coreml");

fs.mkdirSync(path.dirname(output), { recursive: true });
if (!fs.existsSync(output) || !fs.readFileSync(output).equals(fs.readFileSync(built))) {
  fs.copyFileSync(built, output);
  fs.chmodSync(output, 0o755);
  console.log("built", output);
} else {
  console.log("upscayl-coreml is up to date");
}
