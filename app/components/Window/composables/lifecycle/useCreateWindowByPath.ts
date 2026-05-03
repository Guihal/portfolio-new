import type { FsFile } from "~~/shared/types/filesystem";
import { useCreateAndRegisterWindow } from "./useCreateAndRegisterWindow";

export async function useCreateWindowByPath(path: string): Promise<boolean> {
	let entity: FsFile | undefined;
	try {
		entity = await $fetch<FsFile>("/api/filesystem/get", {
			responseType: "json",
			query: { path },
		});
	} catch (err) {
		logger.error("[useCreateWindowByPath] fetch", err);
	}

	if (!entity) {
		logger.error("[useCreateWindowByPath] entity not found for path", path);
		return false;
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
