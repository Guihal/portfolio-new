import { join } from 'path';
import { existsSync } from 'node:fs';

function getBasePath() {
    // Продакшн (Vercel) — .output/server/assets/entry
    const prodPath = join(process.cwd(), '.output/server/assets/entry');
    if (existsSync(prodPath)) return prodPath;

    // Dev — server/assets/entry (относительно корня проекта)
    return join(process.cwd(), 'server/assets/entry');
}

export const BASEPATH = getBasePath();
