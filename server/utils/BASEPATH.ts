import { join } from 'path';
import { existsSync } from 'node:fs';

function getBasePath() {
    // Продакшн (Vercel) — .output/server/assets/entry
    const prodPath = join(process.cwd(), 'public/entry');
    console.log('Проверяем продакшн путь:', prodPath);
    if (existsSync(prodPath)) return prodPath;

    // Dev — server/assets/entry (относительно корня проекта)
    return join(process.cwd(), 'public/entry');
}

export const BASEPATH = getBasePath();
