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

  // Vulkan GPU selection happens in upscayl-bin; we use getGPUInfo() as a
  // lightweight fallback for System Info, which can be less accurate.
  const selectPrimaryGpuDevice = (info: any) => {
    const devices = info?.gpuDevice;
    if (!Array.isArray(devices) || devices.length === 0) return null;
    const active = devices.find((device) => device?.active);
    return active ?? devices[0];
  };

  const extractDeviceStringFromRenderer = (renderer: string) => {
    if (!renderer) return "";
    const match = renderer.match(
      /\(([^,]+),\s*([^()]+?)\s*\(0x[0-9A-Fa-f]+\)/,
    );
    if (match?.[2]) return match[2].trim();
    const fallback = renderer.match(/\(([^,]+),\s*(.+?)\s*\)/);
    if (fallback?.[2]) return fallback[2].trim();
    return renderer.trim();
  };

  const buildGpuInfo = (info: any) => {
    if (!info) return null;
    const aux = info?.auxAttributes ?? {};
    const baseDevice = selectPrimaryGpuDevice(info);
    if (!baseDevice && Object.keys(aux).length === 0) return null;

    const glRenderer = aux?.glRenderer;
    const parsedDeviceString = extractDeviceStringFromRenderer(glRenderer);
    const hasBadDeviceString =
      !baseDevice?.deviceString ||
      /SwiftShader/i.test(baseDevice.deviceString) ||
      /ANGLE/i.test(baseDevice.deviceString);
    const shouldOverride =
      parsedDeviceString &&
      hasBadDeviceString &&
      !/SwiftShader/i.test(parsedDeviceString);

    return {
      ...(baseDevice ?? {}),
      ...(shouldOverride && { deviceString: parsedDeviceString }),
    };
  };

  const selectedGpu = buildGpuInfo(gpuInfo);

  const deviceSpecs = {
    platform: getPlatform(),
    release: os.release(),
    arch: getArch(),
    model: os.cpus()[0].model.trim(),
    cpuCount: os.cpus().length,
    ...(selectedGpu && { gpu: selectedGpu }),
  };

  return deviceSpecs;
};
