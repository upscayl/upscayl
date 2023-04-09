"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBatchSharpenArguments = exports.getBatchArguments = exports.getDoubleUpscaleSecondPassArguments = exports.getDoubleUpscaleArguments = exports.getSingleImageSharpenArguments = exports.getSingleImageArguments = void 0;
const getSingleImageArguments = (inputDir, fullfileName, outFile, modelsPath, model, scale, gpuId, saveImageAs) => {
    return [
        "-i",
        inputDir + "/" + fullfileName,
        "-o",
        outFile,
        "-s",
        scale == "2" ? "4" : scale,
        "-m",
        modelsPath,
        "-n",
        model,
        gpuId ? `-g ${gpuId}` : "",
        "-f",
        saveImageAs,
    ];
};
exports.getSingleImageArguments = getSingleImageArguments;
const getSingleImageSharpenArguments = (inputDir, fullfileName, outFile, modelsPath, model, scale, gpuId, saveImageAs) => {
    return [
        "-i",
        inputDir + "/" + fullfileName,
        "-o",
        outFile,
        "-s",
        scale,
        "-x",
        "-m",
        modelsPath + "/" + model,
        gpuId ? `-g ${gpuId}` : "",
        "-f",
        saveImageAs,
    ];
};
exports.getSingleImageSharpenArguments = getSingleImageSharpenArguments;
const getDoubleUpscaleArguments = (inputDir, fullfileName, outFile, modelsPath, model, gpuId, saveImageAs) => {
    return [
        "-i",
        inputDir + "/" + fullfileName,
        "-o",
        outFile,
        "-s",
        "4",
        "-m",
        modelsPath,
        "-n",
        model,
        gpuId ? `-g ${gpuId}` : "",
        "-f",
        saveImageAs,
    ];
};
exports.getDoubleUpscaleArguments = getDoubleUpscaleArguments;
const getDoubleUpscaleSecondPassArguments = (isAlpha, outFile, modelsPath, model, gpuId, saveImageAs) => {
    return [
        "-i",
        isAlpha ? outFile + ".png" : outFile,
        "-o",
        isAlpha ? outFile + ".png" : outFile,
        "-s",
        "4",
        "-m",
        modelsPath,
        "-n",
        model,
        gpuId ? `-g ${gpuId}` : "",
        "-f",
        isAlpha ? "" : saveImageAs,
    ];
};
exports.getDoubleUpscaleSecondPassArguments = getDoubleUpscaleSecondPassArguments;
const getBatchArguments = (inputDir, outputDir, modelsPath, model, gpuId, saveImageAs) => {
    return [
        "-i",
        inputDir,
        "-o",
        outputDir,
        "-s",
        "4",
        "-m",
        modelsPath,
        "-n",
        model,
        gpuId ? `-g ${gpuId}` : "",
        "-f",
        saveImageAs,
    ];
};
exports.getBatchArguments = getBatchArguments;
const getBatchSharpenArguments = (inputDir, outputDir, modelsPath, model, gpuId, saveImageAs) => {
    return [
        "-i",
        inputDir,
        "-o",
        outputDir,
        "-s",
        "4",
        "-x",
        "-m",
        modelsPath + "/" + model,
        gpuId ? `-g ${gpuId}` : "",
        "-f",
        saveImageAs,
    ];
};
exports.getBatchSharpenArguments = getBatchSharpenArguments;
