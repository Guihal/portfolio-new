// P8-14: чтение manifest.json из server-asset storage с cached-function TTL.
// Public surface: loadManifest() — kept stable за счёт реэкспорта из index.ts.

import type { Manifest } from "~~/shared/types/filesystem";
import { MANIFEST_CACHE_MAX_AGE } from "../cacheLifetime";

async function readManifestFromStorage(): Promise<Manifest> {
	const storage = useStorage("assets:server");
	const raw = await storage.getItem<string>("manifest.json");

	if (!raw) {
		throw createError({
			statusCode: 500,
			statusMessage:
				"manifest.json not found. Run `bun run generate:manifest` before building.",
		});
	}

	return typeof raw === "string" ? JSON.parse(raw) : raw;
}

export const loadManifest = defineCachedFunction(readManifestFromStorage, {
	name: "manifest",
	maxAge: MANIFEST_CACHE_MAX_AGE,
	getKey: () => "v1",
});
