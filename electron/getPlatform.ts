"use strict";

import { platform } from "os";

const getPlatform = () => {
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

export default getPlatform;
