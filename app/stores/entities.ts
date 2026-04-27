// P8-04 — shared entity cache + in-flight dedup.
// Контракт: cache по canonical path, concurrent fetches того же path
// дедуплицируются. Errors НЕ кэшируются — после reject следующий fetch
// делает новый запрос. Без module-scope state (RULES.md §2a P1-09).

import { defineStore } from "pinia";
import { FsClient } from "~/services/filesystem";
import type { FsFile } from "~~/shared/types/filesystem";

type FetchOpts = { signal?: AbortSignal };

export const useEntitiesStore = defineStore("entities", () => {
	// Map'ы — внутри factory, isolated per Pinia instance (per-request на SSR).
	const cache = new Map<string, FsFile>();
	const inFlight = new Map<string, Promise<FsFile>>();

	/**
	 * Non-fetching readonly accessor — отдаёт уже закэшированный entity без
	 * сетевого запроса. Не трогает inFlight.
	 */
	function peek(path: string): FsFile | undefined {
		return cache.get(path);
	}

	/**
	 * Fetch entity по path. Resolution order:
	 *   1. cache hit → resolved promise.
	 *   2. in-flight по тому же path → разделить промис.
	 *   3. иначе FsClient.get(path, opts), при success кладём в cache,
	 *      при reject inFlight removed (cache не обновляется).
	 *
	 * Caveat: при concurrent calls с разными signal'ами оба caller'а получат
	 * одну underlying promise — abort одного signal'а отменит underlying request
	 * для всех. Acceptable для текущего scope (типичный кейс — один signal
	 * на window-level, абортится только при dispose).
	 */
	function fetch(path: string, opts?: FetchOpts): Promise<FsFile> {
		const cached = cache.get(path);
		if (cached) return Promise.resolve(cached);

		const pending = inFlight.get(path);
		if (pending) return pending;

		const promise = FsClient.get(path, opts).then(
			(file) => {
				cache.set(path, file);
				inFlight.delete(path);
				return file;
			},
			(err) => {
				inFlight.delete(path);
				throw err;
			},
		);
		inFlight.set(path, promise);
		return promise;
	}

	/**
	 * Invalidate one entry (если path задан) или весь cache (если undefined).
	 * inFlight не трогаем — текущий запрос завершится естественно.
	 */
	function invalidate(path?: string): void {
		if (path === undefined) {
			cache.clear();
			return;
		}
		cache.delete(path);
	}

	return { fetch, peek, invalidate };
});
