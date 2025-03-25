import { NestedFolderPayload } from "@common/types/types";
import getDirectoriesAndSubDirectories from "../utils/get-subdirectories";
import logit from "../utils/logit";


const getNestedFoldersWithRespectToDepth = async (event, nestedFolderPayload: NestedFolderPayload) => {
    return await getDirectoriesAndSubDirectories(nestedFolderPayload.folderName,  nestedFolderPayload.depth);
}


export default getNestedFoldersWithRespectToDepth