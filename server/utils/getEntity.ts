import { Entity } from '~~/shared/types/Entity';
import { getProtectedPath } from './getProtectedPath';
import { normalize } from 'path';
import { readFile } from 'node:fs/promises';

export async function getEntity(path: string): Promise<null | Entity> {
    if (!path) return null;
    const fullPath = normalize(getProtectedPath(path) + '/entity.json');

    try {
        const fileContent = await readFile(fullPath, 'utf-8');
        const entity = JSON.parse(fileContent);
        return entity;
    } catch (er) {
        if (er instanceof SyntaxError) {
            console.error('Невалидный JSON:', fullPath, er);
        }
        console.error('Ошибка чтения entity по пути:', fullPath, er);
        return null;
    }
}
