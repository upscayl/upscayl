import fs, { readdirSync } from 'fs'
import path from 'path';

/**
 * 
 * @param folderPath root folder to process 
 * @param depth how much depth we need to process 
 * @returns all directories containe images with respect to depth
 */
export const getDirectoriesAndSubDirectories = (folderPath: string, depth: number = -1) => {
    let directoriesContainImages: string[] =  [];

    const checkFileContaineImages = (rootFolder, adepth = 0) => {
        if(depth >= 0 && adepth > depth) return;
        const readdir = readdirSync(rootFolder);
        // REGULAR EXPRISSION OF ALL SUPPRTED FORMATES
        const regExp = /\.(png|jpg|jpeg|webp)$/i;
        readdir.forEach((filename) => {
            const fullPathToFile = path.join(rootFolder, filename);
            if(fs.statSync(fullPathToFile).isDirectory()) {
                checkFileContaineImages(fullPathToFile, adepth + 1);
            }else if(filename.match(regExp) && !directoriesContainImages.includes(rootFolder)) {
                directoriesContainImages.push(rootFolder);
            }
        });
    }

    checkFileContaineImages(folderPath);
    return directoriesContainImages;
}


export default getDirectoriesAndSubDirectories


