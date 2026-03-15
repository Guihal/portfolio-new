import { readdir } from 'node:fs/promises';

export async function getFilesArrayByPath(path: string) {
    try {
        path = getProtectedPath(path);
        const entries = await readdir(path, { withFileTypes: true });

        return entries;
    } catch (e) {
        console.log(e);
        return [];
    }
}
