import type { CodeWindowsConfig } from "~~/server/utils/manifest/resolveCodeContent";
import type { FsFile } from "~~/shared/types/filesystem";
import { useCreateAndRegisterWindow } from "./useCreateAndRegisterWindow";

const CASCADE_PATH_RE = /^(.+)\/code-cascade$/;

export async function fetchEntity(path: string): Promise<FsFile | undefined> {
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

export async function fetchContent(path: string): Promise<
	| {
			images?: string[];
			codes?: unknown[];
			codeWindows?: CodeWindowsConfig;
	  }
	| undefined
> {
	try {
		return await $fetch<{
			images?: string[];
			codes?: unknown[];
			codeWindows?: CodeWindowsConfig;
		}>("/api/filesystem/content", {
			responseType: "json",
			query: { path },
		});
	} catch (err) {
		logger.error("[useCreateWindowByPath] content fetch", err);
		return undefined;
	}
}

async function spawnCascade(
	parentPath: string,
	config: CodeWindowsConfig,
): Promise<void> {
	const { useCascadeLayout } = await import("~/composables/useCascadeLayout");
	const { spawnCodeWindows } = useCascadeLayout();
	await spawnCodeWindows(parentPath, config);
}

export async function tryCascade(path: string): Promise<boolean | null> {
	const cascadeMatch = path.match(CASCADE_PATH_RE);
	if (!cascadeMatch) return null;
	const parentPath = cascadeMatch[1];
	if (!parentPath) {
		logger.error("[useCreateWindowByPath] invalid cascade path", path);
		return false;
	}
	const parent = await fetchEntity(parentPath);
	if (!parent) return false;
	const content = await fetchContent(parentPath);
	const config = content?.codeWindows;
	if (config && config.windows.length > 0) {
		await spawnCascade(parentPath, config);
		return true;
	}
	const file: FsFile = { ...parent, path: parent.path ?? parentPath };
	try {
		useCreateAndRegisterWindow(file);
		return true;
	} catch (e) {
		logger.error("[useCreateWindowByPath] cascade fallback register", e);
		return false;
	}
}
