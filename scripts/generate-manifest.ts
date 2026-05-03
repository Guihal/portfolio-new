import {
	existsSync,
	readdirSync,
	readFileSync,
	statSync,
	writeFileSync,
} from "fs";
import { join, normalize } from "path";
import { z } from "zod";

const ENTRY_DIR = join(process.cwd(), "server", "assets", "entry");
const OUT_FILE = join(process.cwd(), "server", "assets", "manifest.json");

const EntitySchema = z.object({
	name: z.string(),
	programType: z.enum([
		"about",
		"explorer",
		"project",
		"tproject",
		"code",
		"showcase",
	]),
	hidden: z.boolean().optional(),
	year: z.string().optional(),
	tags: z.array(z.string()).optional(),
	description: z.string().optional(),
	links: z.array(z.object({ label: z.string(), href: z.string() })).optional(),
});

type Entity = z.infer<typeof EntitySchema>;

type ManifestNode = {
	name: string;
	path: string;
	entity?: Entity;
	children: ManifestNode[];
};

function readEntity(dirPath: string): Entity | undefined {
	const entityPath = join(dirPath, "entity.json");
	if (!existsSync(entityPath)) return undefined;
	try {
		const raw = JSON.parse(readFileSync(entityPath, "utf-8"));
		return EntitySchema.parse(raw);
	} catch {
		return undefined;
	}
}

function buildTree(absDir: string, relBase = ""): ManifestNode[] {
	let items: string[];
	try {
		items = readdirSync(absDir);
	} catch {
		return [];
	}

	const nodes: ManifestNode[] = [];

	for (const item of items) {
		if (item === "manifest.json" || item === "entity.json") continue;

		const absPath = join(absDir, item);
		const relPath = normalize(join(relBase, item)).replace(/\\/g, "/");
		const routePath = "/" + relPath;

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
	entity?: Entity;
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

export function generateManifest(entryDir: string, outFile: string): void {
	const rootEntity = readEntity(entryDir);
	const tree = buildTree(entryDir);
	const flatIndex = buildFlatIndex(tree);

	if (rootEntity) {
		flatIndex["/"] = { name: "/", path: "/", entity: rootEntity };
	}

	const manifest = {
		generatedAt: new Date().toISOString(),
		rootEntity,
		tree,
		flatIndex,
	};

	writeFileSync(outFile, JSON.stringify(manifest, null, 2), "utf-8");
	console.log(`[manifest] Written to ${outFile}`);
	console.log(`[manifest] ${Object.keys(flatIndex).length} entries indexed`);
}

if (import.meta.main) {
	generateManifest(ENTRY_DIR, OUT_FILE);
}
