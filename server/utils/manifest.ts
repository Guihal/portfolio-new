import type {
	Entity,
	FsFile,
	Manifest,
	ManifestNode,
} from "~~/shared/types/filesystem";
import { MANIFEST_CACHE_MAX_AGE } from "./cacheLifetime";

async function readManifestFromStorage(): Promise<Manifest> {
	const storage = useStorage("assets:server");
	const raw = await storage.getItem<string>("manifest.json");

	if (!raw) {
		throw createError({
			statusCode: 500,
			statusMessage:
				"manifest.json not found. Run `bun run generate:manifest` before building.",
		});
	}

	return typeof raw === "string" ? JSON.parse(raw) : raw;
}

export const loadManifest = defineCachedFunction(readManifestFromStorage, {
	name: "manifest",
	maxAge: MANIFEST_CACHE_MAX_AGE,
	getKey: () => "v1",
});

export function findNode(
	tree: ManifestNode[],
	path: string,
): ManifestNode | null {
	if (path === "/") {
		return { name: "Рабочий стол", path: "/", children: tree };
	}

	for (const node of tree) {
		if (node.path === path) return node;
		if (path.startsWith(`${node.path}/`)) {
			const found = findNode(node.children, path);
			if (found) return found;
		}
	}
	return null;
}

export async function getEntity(path: string): Promise<Entity | null> {
	if (!path) return null;
	const m = await loadManifest();
	return m.flatIndex[path]?.entity ?? null;
}

export async function listChildren(path: string): Promise<FsFile[]> {
	const m = await loadManifest();
	const node = findNode(m.tree, path);
	if (!node) return [];

	const out: FsFile[] = [];
	for (const child of node.children) {
		if (!child.entity) continue;
		out.push({ ...child.entity, path: child.path });
	}
	return out;
}

export async function getBreadcrumbs(path: string): Promise<FsFile[] | null> {
	// Invariant: path validated через pathSchema (.startsWith('/')); defensive guard
	// для external util callers без validation.
	if (!path.startsWith("/")) return null;

	const segments = path.split("/").filter(Boolean);
	segments.unshift("");
	const breadcrumbs: FsFile[] = [];
	const cur: string[] = [];

	for (const s of segments) {
		cur.push(s);
		let p = cur.join("/");
		if (!p) p = "/";

		const entity = await getEntity(p);
		if (!entity) return null;

		breadcrumbs.push({ ...entity, path: p });
	}

	return breadcrumbs;
}
