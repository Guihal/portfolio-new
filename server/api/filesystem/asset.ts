import { createReadStream, promises as fs } from "node:fs";
import { isError } from "h3";
import { resolveEntryPath } from "~~/server/utils/entryPath";
import { serverError } from "~~/server/utils/errors";

const ASSET_PATH_RE =
	/^[\w\-/.]+\.(png|jpg|jpeg|webp|avif|svg|html|css|js|json|txt)$/i;

function parseAssetQuery(query: unknown): { path: string } {
	if (typeof query !== "object" || query === null) {
		throw createError({
			statusCode: 400,
			statusMessage: "Invalid query",
		});
	}
	const q = query as Record<string, unknown>;
	const path = q.path;
	if (typeof path !== "string" || path.length === 0 || path.length > 1024) {
		throw createError({
			statusCode: 400,
			statusMessage: "Invalid path",
		});
	}
	if (!ASSET_PATH_RE.test(path)) {
		throw createError({
			statusCode: 400,
			statusMessage: "Invalid asset path",
		});
	}
	return { path };
}

function getMimeType(ext: string): string {
	switch (ext.toLowerCase()) {
		case "png":
			return "image/png";
		case "jpg":
		case "jpeg":
			return "image/jpeg";
		case "webp":
			return "image/webp";
		case "avif":
			return "image/avif";
		case "svg":
			return "image/svg+xml";
		case "html":
			return "text/html";
		case "css":
			return "text/css";
		case "js":
			return "application/javascript";
		case "json":
			return "application/json";
		default:
			return "text/plain";
	}
}

export default defineEventHandler(async (event) => {
	try {
		const { path } = parseAssetQuery(getQuery(event));
		const fullPath = resolveEntryPath(path);
		if (!fullPath) {
			throw createError({ statusCode: 403 });
		}

		const stat = await fs.stat(fullPath).catch(() => null);
		if (!stat?.isFile()) {
			throw createError({ statusCode: 404 });
		}

		const extMatch = /\.([a-zA-Z0-9]+)$/.exec(path);
		const ext = extMatch?.[1] ?? "txt";
		const mime = getMimeType(ext);

		setResponseHeader(event, "Content-Type", mime);
		setResponseHeader(
			event,
			"Cache-Control",
			"public, s-maxage=86400, stale-while-revalidate=300",
		);
		return sendStream(event, createReadStream(fullPath));
	} catch (e) {
		if (isError(e)) throw e;
		throw serverError(e);
	}
});
