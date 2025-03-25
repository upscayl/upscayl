"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDirectoriesAndSubDirectories = exports.cn = void 0;
const clsx_1 = require("clsx");
const tailwind_merge_1 = require("tailwind-merge");
const fs_1 = __importStar(require("fs"));
const path_1 = __importDefault(require("path"));
function cn(...inputs) {
    return (0, tailwind_merge_1.twMerge)((0, clsx_1.clsx)(inputs));
}
exports.cn = cn;
/**
 *
 * @param folderPath root folder to process
 * @param depth how much depth we need to process
 * @returns all directories containe images with respect to depth
 */
const getDirectoriesAndSubDirectories = (folderPath, depth = -1) => {
    let directoriesContainImages = [];
    const checkFileContaineImages = (rootFolder, adepth = 0) => {
        if (depth >= 0 && adepth > depth)
            return;
        const readdir = (0, fs_1.readdirSync)(rootFolder);
        // REGULAR EXPRISSION OF ALL SUPPRTED FORMATES
        const regExp = /\.(png|jpg|jpeg|webp)$/i;
        readdir.forEach((filename) => {
            const fullPathToFile = path_1.default.join(rootFolder, filename);
            if (fs_1.default.statSync(fullPathToFile).isDirectory()) {
                checkFileContaineImages(fullPathToFile, adepth + 1);
            }
            else if (filename.match(regExp) && !directoriesContainImages.includes(rootFolder)) {
                directoriesContainImages.push(rootFolder);
            }
        });
    };
    checkFileContaineImages(folderPath);
    return directoriesContainImages;
};
exports.getDirectoriesAndSubDirectories = getDirectoriesAndSubDirectories;
