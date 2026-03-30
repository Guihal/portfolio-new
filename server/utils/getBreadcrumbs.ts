export async function getBreadcrumbs(path: string) {
    if (!path.includes('/')) return null;

    const segments = path.split('/').filter(Boolean);
    segments.unshift('');
    const breadcrumbs = [];

    const currentSegments: string[] = [];

    for (const segment of segments) {
        currentSegments.push(segment);
        let currentPath = `${currentSegments.join('/')}`;
        if (!currentPath) currentPath = '/';

        const entity = await getEntity(currentPath);
        if (!entity) return null;

        breadcrumbs.push({
            path: currentPath,
            ...entity,
        });
    }

    return breadcrumbs;
}
