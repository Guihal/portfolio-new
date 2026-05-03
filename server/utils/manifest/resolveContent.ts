// P8-14: resolve structured content for an entry path (images, code snippets, codeWindows).
// Pure function — reads FS, returns EntityContent or null.

import { promises as fs } from "node:fs";
import { resolve as resolvePath } from "node:path";
import type { Entity } from "~~/shared/types/filesystem";
import type { CodeSnippet, CodeWindowMeta } from "./resolveCodeContent";
import { readCodes, readCodeWindows } from "./resolveCodeContent";
import { getEntity } from "./resolveEntity";

const SERVER_ASSETS_ENTRY_ROOT = resolvePath(
	process.cwd(),
	"server/assets/entry",
);

const IMAGE_RE = /^[a-zA-Z0-9._-]+\.(png|jpg|jpeg|webp|svg)$/i;

export type EntityContent = {
	path: string;
	entity: Entity;
	images?: string[];
	codes?: CodeSnippet[];
	codeWindows?: CodeWindowMeta[];
};

async function statSafe(p: string) {
	try {
		return await fs.stat(p);
	} catch {
		return null;
	}
}

async function readImages(
	dir: string,
	entryPath: string,
): Promise<string[] | undefined> {
	const imgDir = resolvePath(dir, "images");
	const s = await statSafe(imgDir);
	if (!s?.isDirectory()) return undefined;

	const entries = await fs.readdir(imgDir);
	const names: string[] = [];
	for (const name of entries) {
		if (IMAGE_RE.test(name)) names.push(name);
	}
	if (names.length === 0) return undefined;
	names.sort((a, b) => a.localeCompare(b));

	return names.map(
		(name) =>
			`/api/filesystem/asset?path=${encodeURIComponent(`${entryPath}/images/${name}`)}`,
	);
}

export async function resolveContent(
	path: string,
): Promise<EntityContent | null> {
	const entity = await getEntity(path);
	if (!entity) return null;

	const dir = resolvePath(SERVER_ASSETS_ENTRY_ROOT, path);
	const images = await readImages(dir, path);
	const codeWindows = await readCodeWindows(dir);

	let codes: CodeSnippet[] | undefined;
	if (entity.programType === "code") codes = await readCodes(dir);

	const result: EntityContent = { path, entity };
	if (images !== undefined) result.images = images;
	if (codes !== undefined) result.codes = codes;
	if (codeWindows !== undefined) result.codeWindows = codeWindows;
	return result;
}
