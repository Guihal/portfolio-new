// P8-14: высокоуровневые resolve-операции над manifest — entity-by-path,
// children list, breadcrumbs trail. Импортят из loadManifest/findNode,
// поэтому вынесены в отдельный файл (concerns: resolve != storage/traversal).

import type { Entity, FsFile } from "~~/shared/types/filesystem";
import { findNode } from "./findNode";
import { loadManifest } from "./loadManifest";

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
