import { CACHE_LIFETIME } from '~~/server/utils/CACHELIFETIME';
import { getAllEntitiesByPath } from '~~/server/utils/getAllEntitiesByPath';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const path = body.path as string;

    if (!path) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Параметр "path" обязателен',
        });
    }

    const fsFiles = await getAllEntitiesByPath(path);
    console.log(fsFiles, 'файлиуки');
    return fsFiles;
});
