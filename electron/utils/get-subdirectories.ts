import fs from 'fs/promises';
import path from 'path';
import logit from './logit';
/**
 * 
 * @param folderPath root folder to process 
 * @param depth how much depth we need to process 
 * @returns all directories containe images with respect to depth
 */

const getDirectoriesAndSubDirectories = async (folderPath: string, depth: number = -1): Promise<string[]> => {
    const directoriesContainImages: Set<string> = new Set(); 
    const imageRegex = /\.(png|jpg|jpeg|webp)$/i;

    const checkFileContainsImages = async (rootFolder: string, currentDepth: number = 0) => {
        if (depth >= 0 && currentDepth > depth) return;

        try {
            const files = await fs.readdir(rootFolder);
            for (const filename of files) {
                const fullPath = path.join(rootFolder, filename);
                const fileStat = await fs.stat(fullPath);

                if (fileStat.isDirectory()) {
                    await checkFileContainsImages(fullPath, currentDepth + 1);
                } else if (imageRegex.test(filename)) {
                    directoriesContainImages.add(rootFolder);
                }
            }
        } catch (error) {
            logit(`Error reading directory ${rootFolder}:`, error);
        }
    };

    await checkFileContainsImages(folderPath);
    return Array.from(directoriesContainImages);
};

export default getDirectoriesAndSubDirectories;