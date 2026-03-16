import { readdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = fileURLToPath(new URL('.', import.meta.url));

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
                if (statSync(full).isDirectory()) {
                    const result = findDir(name, full, depth + 1);
                    if (result) return result;
                }
            } catch {}
        }
    } catch {}
    return null;
}

console.log('[SEARCH]', findDir('entry', '/var/task'));

export const BASEPATH = findDir('entry', '/var/task');
