import {
    readdirSync,
    statSync,
    writeFileSync,
    readFileSync,
    existsSync,
} from 'fs';
import { join, normalize, extname } from 'path';

const ENTRY_DIR = join(process.cwd(), 'server', 'assets', 'entry');
const OUT_FILE = join(ENTRY_DIR, 'file-manifest.json');

type FileEntry = {
    name: string;
    path: string;
    type: 'file' | 'directory';
    ext?: string;
    size?: number;
    entity?: {
        name: string;
        programType: string;
    };
};

type ManifestNode = {
    name: string;
    path: string;
    type: 'file' | 'directory';
    ext?: string;
    size?: number;
    entity?: ManifestNode['entity'];
    children?: ManifestNode[];
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

function getFileStats(filePath: string): { size: number; ext: string } | null {
    try {
        const stats = statSync(filePath);
        return {
            size: stats.size,
            ext: extname(filePath).toLowerCase() || undefined,
        };
    } catch {
        return null;
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
        if (item === 'manifest.json' || item === 'file-manifest.json') continue;

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
            const children = buildTree(absPath, relPath);
            const node: ManifestNode = {
                name: item,
                path: routePath,
                type: 'directory',
                entity: readEntity(absPath),
                children,
            };
            nodes.push(node);
        } else {
            const stats = getFileStats(absPath);
            if (stats) {
                nodes.push({
                    name: item,
                    path: routePath,
                    type: 'file',
                    ext: stats.ext,
                    size: stats.size,
                });
            }
        }
    }

    return nodes;
}

type FlatIndex = Record<string, FileEntry>;

function buildFlatIndex(
    nodes: ManifestNode[],
    index: FlatIndex = {},
): FlatIndex {
    for (const node of nodes) {
        const { children, ...rest } = node;
        index[rest.path] = rest as FileEntry;
        if (children) buildFlatIndex(children, index);
    }
    return index;
}

const tree = buildTree(ENTRY_DIR);
const flatIndex = buildFlatIndex(tree);

const manifest = {
    generatedAt: new Date().toISOString(),
    tree,
    flatIndex,
    stats: {
        totalFiles: Object.values(flatIndex).filter(
            (e) => e.type === 'file',
        ).length,
        totalDirectories: Object.values(flatIndex).filter(
            (e) => e.type === 'directory',
        ).length,
    },
};

writeFileSync(OUT_FILE, JSON.stringify(manifest, null, 2), 'utf-8');
console.log(`[file-manifest] Written to ${OUT_FILE}`);
console.log(
    `[file-manifest] ${manifest.stats.totalFiles} files, ${manifest.stats.totalDirectories} directories indexed`,
);
