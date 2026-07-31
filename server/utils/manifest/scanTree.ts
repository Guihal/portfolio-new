// Рекурсивный обход server/assets/entry — источник истины вместо manifest.json.
// Директория с entity.json = сущность; файлы из images/ и папки из codes/
// поднимаются в children родителя как виртуальные ноды (showcase / code),
// чтобы explorer мог на них ссылаться.

import { promises as fs } from "node:fs";
import { resolve as resolvePath } from "node:path";
import { ENTRY_ROOT } from "~~/server/utils/entryPath";
import type { Manifest, ManifestNode } from "~~/shared/types/filesystem";
import { readEntity } from "./entitySchema";

const IMAGE_RE = /^[a-zA-Z0-9._-]+\.(png|jpg|jpeg|webp|svg)$/i;
const CODE_ID_RE = /^[a-z0-9-]+$/;

// Картинки из images/ → ноды `<parent>/<file>` с programType showcase.
async function scanImages(
	dir: string,
	parentPath: string,
): Promise<ManifestNode[]> {
	const names = await fs.readdir(resolvePath(dir, "images")).catch(() => []);
	const valid = names
		.filter((n) => IMAGE_RE.test(n))
		.sort((a, b) => a.localeCompare(b));
	return Promise.all(
		valid.map(async (name) => {
			const filePath = resolvePath(dir, "images", name);
			const stat = await fs.stat(filePath);
			return {
				name,
				path: `${parentPath}/${name}`,
				entity: { name, programType: "showcase" as const },
				mtime: stat.mtime.toISOString(),
				size: stat.size,
				children: [],
			};
		}),
	);
}

// Сниппеты из codes/<id>/ → ноды `<parent>/code/<id>` с programType code.
async function scanCodes(
	dir: string,
	parentPath: string,
): Promise<ManifestNode[]> {
	const codesDir = resolvePath(dir, "codes");
	const ids = (await fs.readdir(codesDir).catch(() => []))
		.filter((id) => CODE_ID_RE.test(id))
		.sort((a, b) => a.localeCompare(b));
	const { readJson } = await import("./entitySchema");
	const settled = await Promise.all(
		ids.map(async (id): Promise<ManifestNode | null> => {
			const dirPath = resolvePath(codesDir, id);
			const stat = await fs.stat(dirPath).catch(() => null);
			if (!stat?.isDirectory()) return null;
			const meta = (await readJson(resolvePath(dirPath, "meta.json"))) as {
				windowTitle?: string;
			} | null;
			return {
				name: id,
				path: `${parentPath}/code/${id}`,
				entity: { name: meta?.windowTitle ?? id, programType: "code" },
				mtime: stat.mtime.toISOString(),
				children: [],
			};
		}),
	);
	return settled.filter((n): n is ManifestNode => n !== null);
}

async function scanDir(dir: string, relBase: string): Promise<ManifestNode[]> {
	const items = (await fs.readdir(dir, { withFileTypes: true }).catch(() => []))
		.filter((i) => i.isDirectory() && i.name !== "images" && i.name !== "codes")
		.sort((a, b) => a.name.localeCompare(b.name));
	const dirNodes = await Promise.all(
		items.map(async (item) => {
			const abs = resolvePath(dir, item.name);
			const path = `${relBase}/${item.name}`;
			const stat = await fs.stat(abs);
			const [entity, children] = await Promise.all([
				readEntity(abs),
				scanDir(abs, path),
			]);
			return {
				name: item.name,
				path,
				entity,
				mtime: stat.mtime.toISOString(),
				size: stat.isFile() ? stat.size : undefined,
				children,
			};
		}),
	);
	return [
		...dirNodes,
		...(await scanImages(dir, relBase)),
		...(await scanCodes(dir, relBase)),
	];
}

function buildFlatIndex(
	nodes: ManifestNode[],
	index: Manifest["flatIndex"] = {},
): Manifest["flatIndex"] {
	for (const { children, ...rest } of nodes) {
		index[rest.path] = rest;
		buildFlatIndex(children, index);
	}
	return index;
}

export async function scanTree(): Promise<Manifest> {
	const rootEntity = await readEntity(ENTRY_ROOT);
	const [rootStat, tree] = await Promise.all([
		fs.stat(ENTRY_ROOT),
		scanDir(ENTRY_ROOT, ""),
	]);
	const flatIndex = buildFlatIndex(tree);

	if (rootEntity) {
		flatIndex["/"] = {
			name: "/",
			path: "/",
			entity: rootEntity,
			mtime: rootStat.mtime.toISOString(),
		};
	} else {
		// Гарантируем flatIndex["/"] даже без entity.json (SEO fallback).
		flatIndex["/"] = {
			name: "/",
			path: "/",
			entity: {
				name: "Рабочий стол",
				programType: "explorer",
				summary:
					"Корневой каталог портфолио — рабочий стол с ярлыками на разделы.",
			},
			mtime: rootStat.mtime.toISOString(),
		};
	}

	return {
		generatedAt: new Date().toISOString(),
		rootEntity,
		tree,
		flatIndex,
	};
}
