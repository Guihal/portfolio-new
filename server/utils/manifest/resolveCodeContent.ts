import { promises as fs } from "node:fs";
import { resolve as resolvePath } from "node:path";
import { z } from "zod";
import { logger } from "~~/shared/utils/logger";

const CODE_ID_RE = /^[a-z0-9-]+$/;
const SNIPPET_FILENAME_RE = /^[a-zA-Z0-9._-]+$/;
const SNIPPET_EXT_RE = /\.(html|css|js|json|txt|ts|scss)$/i;
const MAX_SNIPPET_SIZE = 100 * 1024;

const CodeWindowMetaSchema = z.object({
	windowTitle: z.string(),
	description: z.string().optional(),
	primaryLanguage: z.string().optional(),
});

export type CodeWindowMeta = z.infer<typeof CodeWindowMetaSchema>;

export type CodeFile = {
	filename: string;
	language: string;
	source: string;
};

export type CodeSnippet = {
	id: string;
	meta: CodeWindowMeta;
	files: CodeFile[];
};

function extToLanguage(ext: string): string {
	switch (ext.toLowerCase()) {
		case "html":
			return "html";
		case "css":
			return "css";
		case "js":
			return "javascript";
		case "json":
			return "json";
		case "ts":
			return "typescript";
		case "scss":
			return "scss";
		case "txt":
		default:
			return "text";
	}
}

async function statSafe(p: string) {
	try {
		return await fs.stat(p);
	} catch {
		return null;
	}
}

async function readCodeFiles(snippetDir: string): Promise<CodeFile[]> {
	const files: CodeFile[] = [];
	const fileNames = await fs.readdir(snippetDir);
	for (const fileName of fileNames) {
		if (fileName === "meta.json") continue;
		if (!SNIPPET_FILENAME_RE.test(fileName)) {
			logger.warn("[resolveContent] skip invalid filename:", fileName);
			continue;
		}
		if (!SNIPPET_EXT_RE.test(fileName)) continue;

		const filePath = resolvePath(snippetDir, fileName);
		const s = await statSafe(filePath);
		if (!s?.isFile()) continue;
		if (s.size > MAX_SNIPPET_SIZE) {
			logger.warn("[resolveContent] skip oversized file:", fileName);
			continue;
		}

		const source = await fs.readFile(filePath, "utf-8");
		const extMatch = SNIPPET_EXT_RE.exec(fileName);
		const ext = extMatch?.[1] ?? "txt";
		files.push({
			filename: fileName,
			language: extToLanguage(ext),
			source,
		});
	}
	return files;
}

export async function readCodes(
	dir: string,
): Promise<CodeSnippet[] | undefined> {
	const codesDir = resolvePath(dir, "codes");
	const s = await statSafe(codesDir);
	if (!s?.isDirectory()) return undefined;

	const ids = await fs.readdir(codesDir);
	const out: CodeSnippet[] = [];
	for (const id of ids) {
		if (!CODE_ID_RE.test(id)) {
			logger.warn("[resolveContent] skip invalid code id:", id);
			continue;
		}
		const snippetDir = resolvePath(codesDir, id);
		const sd = await statSafe(snippetDir);
		if (!sd?.isDirectory()) continue;

		let meta: CodeWindowMeta = { windowTitle: id };
		const metaPath = resolvePath(snippetDir, "meta.json");
		const ms = await statSafe(metaPath);
		if (ms?.isFile()) {
			try {
				const raw = await fs.readFile(metaPath, "utf-8");
				meta = CodeWindowMetaSchema.parse(JSON.parse(raw));
			} catch (e) {
				logger.warn("[resolveContent] invalid meta.json for", id, e);
			}
		}

		const files = await readCodeFiles(snippetDir);
		if (files.length > 0) out.push({ id, meta, files });
	}
	return out.length > 0 ? out : undefined;
}

export async function readCodeWindows(
	dir: string,
): Promise<CodeWindowMeta[] | undefined> {
	const cwPath = resolvePath(dir, "codeWindows.json");
	const s = await statSafe(cwPath);
	if (!s?.isFile()) return undefined;
	try {
		const raw = await fs.readFile(cwPath, "utf-8");
		const arr = z.array(CodeWindowMetaSchema).parse(JSON.parse(raw));
		return arr.length > 0 ? arr : undefined;
	} catch (e) {
		logger.warn("[resolveContent] invalid codeWindows.json", e);
		return undefined;
	}
}
