import type { FsFile } from "~~/shared/types/filesystem";
import { useCreateAndRegisterWindow } from "./useCreateAndRegisterWindow";

const IMAGE_PATH_RE = /\/([\w._-]+\.(?:png|jpg|jpeg|webp|svg))$/i;

const CODE_PATH_RE = /^(.+)\/code(?:\/[\w-]+)?$/;

async function fetchEntity(path: string): Promise<FsFile | undefined> {
	try {
		return await $fetch<FsFile>("/api/filesystem/get", {
			responseType: "json",
			query: { path },
		});
	} catch (err) {
		logger.error("[useCreateWindowByPath] fetch", err);
		return undefined;
	}
}

async function fetchContent(
	path: string,
): Promise<{ images?: string[]; codes?: unknown[] } | undefined> {
	try {
		return await $fetch<{ images?: string[]; codes?: unknown[] }>(
			"/api/filesystem/content",
			{
				responseType: "json",
				query: { path },
			},
		);
	} catch (err) {
		logger.error("[useCreateWindowByPath] content fetch", err);
		return undefined;
	}
}

export async function useCreateWindowByPath(path: string): Promise<boolean> {
	// Virtual code paths: /projects/x/code or /projects/x/code/<snippet-id>
	const codeMatch = path.match(CODE_PATH_RE);
	if (codeMatch) {
		const parentPath = codeMatch[1];
		if (!parentPath) {
			logger.error("[useCreateWindowByPath] invalid code path", path);
			return false;
		}
		const parent = await fetchEntity(parentPath);
		if (!parent) {
			logger.error(
				"[useCreateWindowByPath] entity not found for code path",
				path,
			);
			return false;
		}
		const content = await fetchContent(parentPath);
		if (!content?.codes || content.codes.length === 0) {
			logger.error("[useCreateWindowByPath] no codes for path", path);
			return false;
		}
		const file: FsFile = {
			...parent,
			path,
			programType: "code",
		};
		try {
			useCreateAndRegisterWindow(file);
			return true;
		} catch (e) {
			logger.error("[useCreateWindowByPath] register", e);
			return false;
		}
	}

	let entity: FsFile | undefined;
	try {
		entity = await $fetch<FsFile>("/api/filesystem/get", {
			responseType: "json",
			query: { path },
		});
	} catch (err) {
		logger.error("[useCreateWindowByPath] fetch", err);
	}

	// Fallback: deep image path → showcase program.
	if (!entity) {
		const imageMatch = path.match(IMAGE_PATH_RE);
		if (!imageMatch?.[1]) {
			logger.error("[useCreateWindowByPath] entity not found for path", path);
			return false;
		}
		const filename = imageMatch[1];
		const lastSlash = path.lastIndexOf("/");
		if (lastSlash <= 0) {
			logger.error("[useCreateWindowByPath] entity not found for path", path);
			return false;
		}
		const parentPath = path.slice(0, lastSlash);
		let parent: FsFile | undefined;
		try {
			parent = await $fetch<FsFile>("/api/filesystem/get", {
				responseType: "json",
				query: { path: parentPath },
			});
		} catch (err) {
			logger.error("[useCreateWindowByPath] parent fetch", err);
		}
		if (!parent) {
			logger.error("[useCreateWindowByPath] entity not found for path", path);
			return false;
		}
		const validParentTypes = new Set(["project", "explorer"]);
		if (!validParentTypes.has(parent.programType)) {
			logger.error("[useCreateWindowByPath] entity not found for path", path);
			return false;
		}
		// Verify image exists in parent content.
		let content: { images?: string[] } | undefined;
		try {
			content = await $fetch<{ images?: string[] }>("/api/filesystem/content", {
				responseType: "json",
				query: { path: parentPath },
			});
		} catch (err) {
			logger.error("[useCreateWindowByPath] content fetch", err);
		}
		const hasImage = content?.images?.some((u) => u.endsWith(`/${filename}`));
		if (!hasImage) {
			logger.error("[useCreateWindowByPath] entity not found for path", path);
			return false;
		}
		entity = {
			...parent,
			path,
			programType: "showcase",
		};
	}

	// entity.path wins (server canonicalisation); fallback to requested path.
	const file: FsFile = { ...entity, path: entity.path ?? path };

	try {
		useCreateAndRegisterWindow(file);
		return true;
	} catch (e) {
		logger.error("[useCreateWindowByPath] register", e);
		return false;
	}
}
