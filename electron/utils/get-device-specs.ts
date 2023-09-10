"use strict";

import { platform, arch } from "os";

export const getPlatform = () => {
  switch (platform()) {
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
  switch (arch()) {
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
