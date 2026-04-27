// P8-14: чистая функция обхода дерева manifest. Корень '/' маппится на
// синтетический "Рабочий стол" с детьми = top-level tree.

import type { ManifestNode } from "~~/shared/types/filesystem";

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
