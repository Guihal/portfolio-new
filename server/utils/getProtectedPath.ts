import { join, normalize } from 'path';
import { BASEPATH } from './BASEPATH';

export function getProtectedPath(path: string): string {
    const relativePath = path.startsWith(BASEPATH)
        ? path.slice(BASEPATH.length)
        : path;

    const safePath = relativePath.replace(/^([./\\])+/, '');

    return normalize(join(BASEPATH, safePath));
}
