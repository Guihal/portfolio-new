import {
    readdirSync,
    statSync,
    writeFileSync,
    readFileSync,
    existsSync,
} from 'fs';
import { join, normalize } from 'path';

const ENTRY_DIR = join(process.cwd(), 'server', 'assets', 'entry');
const OUT_FILE = join(ENTRY_DIR, 'manifest.json');

type ManifestNode = {
    name: string;
    path: string;
    entity?: {
        name: string;
        programType: string;
    };
    children: ManifestNode[];
};

function readEntity(dirPath: string): ManifestNode['entity'] | undefined {
    const entityPath = join(dirPath, 'entity.json');
    if (!existsSync(entityPath)) return undefined;
    try {
        return JSON.parse(readFileSync(entityPath, 'utf-8'));
    } catch {
        return undefined;
    }
}

function buildTree(absDir: string, relBase = ''): ManifestNode[] {
    let items: string[];
    try {
        items = readdirSync(absDir);
    } catch {
        return [];
    }

    const nodes: ManifestNode[] = [];

    for (const item of items) {
        if (item === 'manifest.json' || item === 'entity.json') continue;

        const absPath = join(absDir, item);
        const relPath = normalize(join(relBase, item)).replace(/\\/g, '/');
        const routePath = '/' + relPath;

        let isDir = false;
        try {
            isDir = statSync(absPath).isDirectory();
        } catch {
            continue;
        }

        if (isDir) {
            nodes.push({
                name: item,
                path: routePath,
                entity: readEntity(absPath),
                children: buildTree(absPath, relPath),
            });
        }
    }

    return nodes;
}

type FlatEntry = {
    name: string;
    path: string;
    entity?: ManifestNode['entity'];
};
type FlatIndex = Record<string, FlatEntry>;

function buildFlatIndex(
    nodes: ManifestNode[],
    index: FlatIndex = {},
): FlatIndex {
    for (const { children, ...rest } of nodes) {
        index[rest.path] = rest;
        if (children) buildFlatIndex(children, index);
    }
    return index;
}

const rootEntity = readEntity(ENTRY_DIR);
const tree = buildTree(ENTRY_DIR);
const flatIndex = buildFlatIndex(tree);

if (rootEntity) {
    flatIndex['/'] = { name: '/', path: '/', entity: rootEntity };
}

const manifest = {
    generatedAt: new Date().toISOString(),
    rootEntity,
    tree,
    flatIndex,
};

writeFileSync(OUT_FILE, JSON.stringify(manifest, null, 2), 'utf-8');
console.log(`[manifest] Written to ${OUT_FILE}`);
console.log(`[manifest] ${Object.keys(flatIndex).length} entries indexed`);
