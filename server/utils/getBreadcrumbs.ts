export async function getBreadcrumbs(path: string) {
    if (!path.includes('/')) return null;

    const segments = path.split('/').filter(Boolean);

    const breadcrumbs = [];
    const manifest = await getManifest();

    let currentPath = '';

    for (const segment of segments) {
        currentPath += `/${segment}`;
        const entityNotFormatted = manifest.flatIndex[currentPath];
        if (!entityNotFormatted) return null;

        const entity = {
            path: currentPath,
            ...entityNotFormatted.entity,
        };

        breadcrumbs.push(entity);
    }

    return breadcrumbs;
}
