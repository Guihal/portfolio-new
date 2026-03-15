import { Entity } from '~~/shared/types/Entity';
import { getProtectedPath } from './getProtectedPath';
import { normalize } from 'path';

export async function getEntity(path: string): Promise<null | Entity> {
    if (!path) return null;
    const fullPath = normalize(getProtectedPath(path) + '/entity.json');

    try {
        const file = Bun.file(fullPath);
        const entity = await file.json();
        return entity;
    } catch (er) {
        if (er instanceof SyntaxError) {
            console.error('Невалидный JSON:', fullPath, er);
        }
        console.error('Ошибка чтения entity по пути:', fullPath, er);
        return null;
    }
}
