import path from 'node:path';
import { getFilesArrayByPath } from './getFilesArrayByPath';
import { FsFile } from '~~/shared/types/FsFile';
import { getProtectedPath } from './getProtectedPath';
import { BASEPATH } from './BASEPATH';
import { getEntity } from './getEntity';

export async function getAllEntitiesByPath(dirPath: string) {
    const files = await getFilesArrayByPath(dirPath);
    const dirPathProtected = getProtectedPath(dirPath);

    const fsFiles: FsFile[] = (
        await Promise.all(
            files.map(async (file) => {
                console.log(file);
                if (!file.isDirectory()) return;

                const filePath = path
                    .join(dirPathProtected, file.name)
                    .replace(BASEPATH, '');

                const entity = await getEntity(filePath);
                if (!entity) return;

                return {
                    ...entity,
                    path: filePath,
                };
            }),
        )
    ).filter(Boolean);

    return fsFiles;
}
