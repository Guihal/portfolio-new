// P8-03 — единая точка доступа к /api/filesystem/{get,list,breadcrumbs}.
// Контракт: $fetch (Nitro umbrella, SSR+CSR safe), retry-once на 5xx,
// abort propagation, error mapping. Без module-scope state (RULES.md §2a).

import type { Breadcrumb, FsFile, FsList } from "~~/shared/types/filesystem";
import { FsAbortedError, FsNotFoundError, FsServerError } from "./errors";

type FetchOpts = { signal?: AbortSignal };

const RETRY_DELAY_MS = 200;

function isAbortLike(err: unknown, signal?: AbortSignal): boolean {
	if (signal?.aborted) return true;
	if (!err || typeof err !== "object") return false;
	const e = err as { name?: string; cause?: { name?: string } };
	if (e.name === "AbortError") return true;
	if (e.cause?.name === "AbortError") return true;
	return false;
}

function getStatus(err: unknown): number | undefined {
	if (!err || typeof err !== "object") return undefined;
	const e = err as {
		statusCode?: number;
		status?: number;
		response?: { status?: number };
	};
	return e.statusCode ?? e.status ?? e.response?.status;
}

function mapError(err: unknown, path: string, signal?: AbortSignal): never {
	if (isAbortLike(err, signal)) throw new FsAbortedError();
	const status = getStatus(err);
	if (status === 404) throw new FsNotFoundError(path);
	const msg = err instanceof Error ? err.message : "Filesystem request failed";
	throw new FsServerError(msg, status, { cause: err });
}

function delay(ms: number, signal?: AbortSignal): Promise<void> {
	return new Promise((resolve, reject) => {
		if (signal?.aborted) {
			reject(new FsAbortedError());
			return;
		}
		const t = setTimeout(() => {
			signal?.removeEventListener("abort", onAbort);
			resolve();
		}, ms);
		const onAbort = () => {
			clearTimeout(t);
			reject(new FsAbortedError());
		};
		signal?.addEventListener("abort", onAbort, { once: true });
	});
}

async function request<T>(
	url: string,
	path: string,
	signal?: AbortSignal,
): Promise<T> {
	let attempt = 0;
	// closure-scoped retry counter — без module-scope state.
	while (true) {
		try {
			return (await $fetch<T>(url, {
				query: { path },
				signal,
			})) as T;
		} catch (err) {
			if (isAbortLike(err, signal)) throw new FsAbortedError();
			const status = getStatus(err);
			if (status !== undefined && status >= 500 && attempt === 0) {
				attempt++;
				await delay(RETRY_DELAY_MS, signal);
				continue;
			}
			mapError(err, path, signal);
		}
	}
}

export const FsClient = {
	get(path: string, opts?: FetchOpts): Promise<FsFile> {
		return request<FsFile>("/api/filesystem/get", path, opts?.signal);
	},
	list(path: string, opts?: FetchOpts): Promise<FsList> {
		return request<FsList>("/api/filesystem/list", path, opts?.signal);
	},
	getBreadcrumbs(path: string, opts?: FetchOpts): Promise<Breadcrumb[]> {
		return request<Breadcrumb[]>(
			"/api/filesystem/breadcrumbs",
			path,
			opts?.signal,
		);
	},
};
