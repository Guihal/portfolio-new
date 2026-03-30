import { CACHE_LIFETIME } from '~~/server/utils/CACHELIFETIME';
import { getEntity } from '~~/server/utils/getEntity';

export default defineCachedEventHandler(
    async (event) => {
        const body = await readBody(event);
        const path = body.path as string;

        if (!path) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Параметр "path" обязателен',
            });
        }

        const entity = await getEntity(path);

        if (!entity) {
            throw createError({
                statusCode: 404,
                statusMessage: 'При открытии файла произошла ошибка',
            });
        }

        return {
            ...entity,
            path: path,
        };
    },
    {
        maxAge: CACHE_LIFETIME,
        getKey: async (event) => {
            const body = await readBody(event);

            return `entity:${body?.path || 'default'}`;
        },
    },
);
