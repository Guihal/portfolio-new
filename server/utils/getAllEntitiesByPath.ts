import type { FsFile } from '~~/shared/types/FsFile';
import { getManifest } from './getManifest';

type ManifestNode = {
    name: string;
    path: string;
    entity?: { name: string; programType: string };
    children: ManifestNode[];
};

function findNode(tree: ManifestNode[], path: string): ManifestNode | null {
    if (path === '/') {
        // Корень — возвращаем виртуальный узел с children = tree
        return { name: 'Рабочий стол', path: '/', children: tree };
    }

    for (const node of tree) {
        if (node.path === path) return node;
        if (path.startsWith(node.path + '/')) {
            const found = findNode(node.children, path);
            if (found) return found;
        }
    }
    return null;
}

export async function getAllEntitiesByPath(dirPath: string): Promise<FsFile[]> {
    const manifest = await getManifest();

    const node = findNode(manifest.tree, dirPath);
    if (!node) return [];

    const result: FsFile[] = [];

    for (const child of node.children) {
        console.log('child:', child.path, '| has entity:', !!child.entity);
        if (!child.entity) continue;
        result.push({
            ...child.entity,
            path: child.path,
        } as FsFile);
    }

    return result;
}
