"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const binaries_1 = require("./binaries");
function upscaylImage(inputFile, outFile, modelsPath, model) {
    // UPSCALE
    let upscayl = (0, child_process_1.spawn)((0, binaries_1.execPath)("realesrgan"), ["-i", inputFile, "-o", outFile, "-s", "4", "-m", modelsPath, "-n", model], {
        cwd: undefined,
        detached: false,
    });
    return upscayl;
}
module.exports = { upscaylImage };
