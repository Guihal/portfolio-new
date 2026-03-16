import { readdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = fileURLToPath(new URL('.', import.meta.url));

function getBasePath() {
    console.log('[CWD]', process.cwd());
    console.log('[__dirname]', __dirname);
    console.log('[CWD contents]', readdirSync(process.cwd()));
    console.log('[__dirname contents]', readdirSync(__dirname));

    if (!import.meta.dev) {
        const prodPath = join(process.cwd(), 'entry');
        return prodPath;
    } else {
        return join(process.cwd(), 'public/entry');
    }
    //сука
}

export const BASEPATH = getBasePath();
