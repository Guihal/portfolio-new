import type { Entity } from '~~/shared/types/Entity';
import { getManifest } from './getManifest';

export async function getEntity(path: string): Promise<null | Entity> {
    if (!path) return null;

    const manifest = await getManifest();

    const entry = manifest.flatIndex[path];
    if (!entry?.entity) return null;

    return entry.entity as Entity;
}
