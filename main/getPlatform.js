"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const os_1 = require("os");
const getPlatform = () => {
    switch ((0, os_1.platform)()) {
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
exports.default = getPlatform;
