"use strict";

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
    case "ia32":
      return "x86";
    case "arm":
      return "arm";
    case "arm64":
      return "arm64";
  }
};

/**
 * Runs in the main process. The page lives in a sandbox with no access to `os`, so it asks for this over IPC
 * (`get-system-info`) and the GPU info is passed in from there.
 */
export const getDeviceSpecs = (gpuInfo?: { gpuDevice?: Record<string, any>[] } | null) => {
  const cpus = os.cpus();
  const gpu = gpuInfo?.gpuDevice?.[0];
  return {
    platform: getPlatform(),
    release: os.release(),
    arch: getArch(),
    model: cpus[0]?.model.trim() ?? "",
    cpuCount: cpus.length,
    ...(gpu && { gpu }),
  };
};
