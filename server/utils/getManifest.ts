type ManifestEntry = {
    name: string;
    path: string;
    entity?: {
        name: string;
        programType: string;
    };
};

type ManifestNode = ManifestEntry & {
    children: ManifestNode[];
};

export type Manifest = {
    generatedAt: string;
    rootEntity?: ManifestEntry['entity'];
    tree: ManifestNode[];
    flatIndex: Record<string, ManifestEntry>;
};

// В prod кэшируем навсегда, в dev читаем каждый раз чтобы подхватить изменения
let _manifest: Manifest | null = null;
const isDev = process.env.NODE_ENV === 'development';

export async function getManifest(): Promise<Manifest> {
    if (!isDev && _manifest) return _manifest;

    const storage = useStorage('assets:entry');
    const raw = await storage.getItem<string>('manifest.json');

    if (!raw) {
        throw createError({
            statusCode: 500,
            statusMessage:
                'manifest.json not found. Run `bun run generate:manifest` before building.',
        });
    }

    const parsed: Manifest = typeof raw === 'string' ? JSON.parse(raw) : raw;

    if (!isDev) _manifest = parsed;

    return parsed;
}
