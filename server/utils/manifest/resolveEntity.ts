// P8-14: высокоуровневые resolve-операции над manifest — entity-by-path,
// children list, breadcrumbs trail. Раньше читали через cached
// `loadManifest(scanTree)`, но endpoint-кеш (`defineCachedEventHandler`)
// уже держит свежесть, и скрытый кеш мешал дебажить ENOENT. Теперь прямой
// `await scanTree()` каждый раз.

import type { Entity, FsFile } from "~~/shared/types/filesystem";
import { findNode } from "./findNode";
import { scanTree } from "./scanTree";

export async function getEntity(path: string): Promise<Entity | null> {
	if (!path) return null;
	const m = await scanTree();
	return m.flatIndex[path]?.entity ?? null;
}

export async function listChildren(path: string): Promise<FsFile[]> {
	const m = await scanTree();
	const node = findNode(m.tree, path);
	if (!node) return [];

	const out: FsFile[] = [];
	for (const child of node.children) {
		if (!child.entity) continue;
		out.push({
			...child.entity,
			path: child.path,
			mtime: child.mtime,
			size: child.size,
		});
	}
	return out;
}

export async function getBreadcrumbs(path: string): Promise<FsFile[] | null> {
	// Invariant: path validated через pathSchema (.startsWith('/')); defensive guard
	// для external util callers без validation.
	if (!path.startsWith("/")) return null;

	const m = await scanTree();
	const segments = path.split("/").filter(Boolean);
	segments.unshift("");
	const breadcrumbs: FsFile[] = [];
	const cur: string[] = [];

	for (const s of segments) {
		cur.push(s);
		let p = cur.join("/");
		if (!p) p = "/";

		const entry = m.flatIndex[p];
		if (!entry?.entity) return null;
		breadcrumbs.push({
			...entry.entity,
			path: p,
			mtime: entry.mtime,
			size: entry.size,
		});
	}

	return breadcrumbs;
}
