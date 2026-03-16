import { join } from 'path';

function getBasePath() {
    if (!import.meta.dev) {
        const prodPath = join(process.cwd(), 'entry');
        return prodPath;
    } else {
        return join(process.cwd(), 'public/entry');
    }
}

export const BASEPATH = getBasePath();
