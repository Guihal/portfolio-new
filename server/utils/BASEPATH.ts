import { readdirSync } from 'fs';
import { join } from 'path';
import { statSync } from 'node:fs';

function findDir(name: string, dir: string, depth = 0): string | null {
    if (depth > 5) return null;
    try {
        const items = readdirSync(dir);
        for (const item of items) {
            if (item === name) {
                const found = join(dir, item);
                console.log(`[FOUND] ${found}`);
                return found;
            }
            try {
                const full = join(dir, item);
                console.log(`[path]`, full);
                if (statSync(full).isDirectory()) {
                    const result = findDir(name, full, depth + 1);
                    if (result) return result;
                }
            } catch (er) {}
        }
    } catch (er) {}
    return null;
}

console.log('[SEARCH]', findDir('entry', '/var'));

export const BASEPATH = findDir('entry', '/var');
