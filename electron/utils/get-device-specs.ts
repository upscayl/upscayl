"use strict";

import { ipcRenderer } from "electron";
import os from "os";

export const getPlatform = () => {
  switch (os.platform()) {
    case "aix":
    case "freebsd":
    case "linux":
    case "openbsd":
    case "android":
      return "linux";
    case "darwin":
    case "sunos":
      return "mac";
    case "win32":
      return "win";
  }
};

export const getArch = () => {
  switch (os.arch()) {
    case "x64":
      return "x64";
    case "x32":
      return "x86";
    case "arm":
      return "arm";
    case "arm64":
      return "arm64";
  }
};

export const getAppVersion = async () => {
  let appVersion = process.env.npm_package_version;
  try {
    appVersion = await ipcRenderer.invoke("get-app-version");
  } catch (error) {
    console.error("Failed to get app version:", error);
  }

  return appVersion;
};

export const getDeviceSpecs = async () => {
  let gpuInfo;
  try {
    gpuInfo = await ipcRenderer.invoke("get-gpu-info");
  } catch (error) {
    console.error("Failed to get GPU info:", error);
    gpuInfo = null;
  }

  const deviceSpecs = {
    platform: getPlatform(),
    release: os.release(),
    arch: getArch(),
    model: os.cpus()[0].model.trim(),
    cpuCount: os.cpus().length,
    ...(gpuInfo && { gpu: gpuInfo.gpuDevice[0] }),
  };

  return deviceSpecs;
};
