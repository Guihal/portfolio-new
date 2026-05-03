import { z } from "zod";

const TRAVERSAL_RE = /(^|\/)\.\.(\/|$)/;
const BACKSLASH_RE = /\\/;
const CONSECUTIVE_SLASH_RE = /\/{2,}/;
const NULL_BYTE_RE = /\0/;
const MAX_PATH_LEN = 1024;

export const pathSchema = z
	.string()
	.min(1, "path is required")
	.max(MAX_PATH_LEN, `path too long (>${MAX_PATH_LEN})`)
	.refine((p) => p.startsWith("/"), "path must start with '/'")
	.refine((p) => !TRAVERSAL_RE.test(p), "path traversal forbidden")
	.refine((p) => !BACKSLASH_RE.test(p), "backslash forbidden")
	.refine((p) => !CONSECUTIVE_SLASH_RE.test(p), "consecutive slashes forbidden")
	.refine((p) => !NULL_BYTE_RE.test(p), "null byte forbidden");

export type ValidPath = z.infer<typeof pathSchema>;

export const pathQuerySchema = z.object({ path: pathSchema });

export function parsePathQuery(query: unknown): { path: string } {
	const res = pathQuerySchema.safeParse(query);
	if (!res.success) {
		throw createError({
			statusCode: 400,
			statusMessage: "Invalid path",
			data: {
				issues: res.error.issues.map((i) => ({
					path: i.path,
					message: i.message,
				})),
			},
		});
	}
	return res.data;
}

const CONTENT_PATH_RE = /^[\w\-/.]+$/;

export const contentPathQuerySchema = z.object({
	path: z
		.string()
		.min(1, "path is required")
		.max(200, "path too long (>200)")
		.refine((p) => !TRAVERSAL_RE.test(p), "path traversal forbidden")
		.refine((p) => CONTENT_PATH_RE.test(p), "invalid path format"),
});

export function parseContentPathQuery(query: unknown): { path: string } {
	const res = contentPathQuerySchema.safeParse(query);
	if (!res.success) {
		throw createError({
			statusCode: 400,
			statusMessage: "Invalid path",
			data: {
				issues: res.error.issues.map((i) => ({
					path: i.path,
					message: i.message,
				})),
			},
		});
	}
	return res.data;
}
