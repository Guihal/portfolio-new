import { CACHE_LIFETIME } from '~~/server/utils/CACHELIFETIME';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const path = body.path as string;
    const breadcrumbs = await getBreadcrumbs(path);

    return breadcrumbs;
});
