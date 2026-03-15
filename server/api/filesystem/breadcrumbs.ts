import { CACHE_LIFETIME } from '~~/server/utils/CACHELIFETIME';
import { getEntity } from '~~/server/utils/getEntity';

export default defineCachedEventHandler(
    async (event) => {
        const body = await readBody(event);
        const path = body.path as string;
        const protectedPath = getProtectedPath(path);
        const relPath = protectedPath.replace(BASEPATH, '');
        const segments = relPath.split('/').filter(Boolean);

        const breadcrumbs = (
            await Promise.all(
                segments.map(async (_, i, arr) => {
                    const segmentPath = '/' + arr.slice(0, i + 1).join('/');
                    const entity = await getEntity(segmentPath);
                    if (!entity) return undefined;
                    return {
                        path: segmentPath,
                        entity,
                    };
                }),
            )
        ).filter(Boolean);

        return breadcrumbs;
    },
    {
        maxAge: CACHE_LIFETIME,
        getKey: async (event) => {
            const body = await readBody(event);

            return `breadcrumbs:${body?.path || 'default'}`;
        },
    },
);
