import type { RouteLocationNormalizedLoadedGeneric, Router } from 'vue-router';

export function useSetPath(
    path: string,
    router: Router,
    route: RouteLocationNormalizedLoadedGeneric,
) {
    if (path === route.path) return;
    router.push(path);
}
