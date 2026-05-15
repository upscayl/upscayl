require("dotenv").config();
const { spawnSync } = require("child_process");
const path = require("path");
const { notarize } = require("@electron/notarize");

function hasAppleIdCredentials() {
  return Boolean(
    process.env.APPLEID && process.env.APPLEIDPASS && process.env.TEAMID,
  );
}

function isDeveloperIdSigned(appPath) {
  const result = spawnSync("codesign", ["-dv", "--verbose=4", appPath], {
    encoding: "utf8",
  });

  if (result.status !== 0) {
    return false;
  }

  const signatureInfo = `${result.stdout}\n${result.stderr}`;

  return !signatureInfo.includes("Signature=adhoc");
}

exports.default = async function notarizing(context) {
  const { electronPlatformName, appOutDir } = context;
  if (electronPlatformName !== "darwin") {
    return;
  }

  if (process.env.SKIP_NOTARIZE === "true") {
    console.log("Skipping notarization because SKIP_NOTARIZE=true.");
    return;
  }

  const appName = context.packager.appInfo.productFilename;
  const appPath = path.join(appOutDir, `${appName}.app`);

  if (!hasAppleIdCredentials()) {
    console.log(
      "Skipping notarization because APPLEID, APPLEIDPASS, or TEAMID is missing.",
    );
    return;
  }

  if (!isDeveloperIdSigned(appPath)) {
    console.log(
      "Skipping notarization because the app is not signed with a Developer ID identity.",
    );
    return;
  }

  return await notarize({
    appBundleId: "org.upscayl.Upscayl",
    appPath,
    appleId: process.env.APPLEID,
    appleIdPassword: process.env.APPLEIDPASS,
    teamId: process.env.TEAMID,
  });
};
