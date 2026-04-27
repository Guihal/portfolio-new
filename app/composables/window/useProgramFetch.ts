// P8-05 — единый fetch-композабл для SFC programs.
// kind='get' → entitiesStore (cache+dedup), kind='list'/'breadcrumbs' → FsClient.
// SSR-hydration через useAsyncData. Abort propagation на onScopeDispose.

import {
	type MaybeRefOrGetter,
	onScopeDispose,
	type Ref,
	ref,
	toValue,
} from "vue";
import { FsClient } from "~/services/filesystem";
import { useEntitiesStore } from "~/stores/entities";
import type { Breadcrumb, FsFile, FsList } from "~~/shared/types/filesystem";

type Kind = "list" | "get" | "breadcrumbs";
type ResultMap = { list: FsList; get: FsFile; breadcrumbs: Breadcrumb[] };

export type UseProgramFetchOpts<K extends Kind> = {
	path: MaybeRefOrGetter<string>;
	kind: K;
};
export type UseProgramFetchReturn<K extends Kind> = {
	data: Ref<ResultMap[K] | null>;
	isLoading: Ref<boolean>;
	error: Ref<unknown>;
	refresh: () => Promise<void>;
};

export async function useProgramFetch<K extends Kind>(
	opts: UseProgramFetchOpts<K>,
): Promise<UseProgramFetchReturn<K>> {
	const { kind } = opts;
	const getPath = (): string => toValue(opts.path);
	const isLoading = ref(false);
	let activeController: AbortController | null = null;
	let disposed = false;
	onScopeDispose(() => {
		disposed = true;
		activeController?.abort();
		activeController = null;
	});

	async function load(): Promise<ResultMap[K] | null> {
		if (disposed) return null;
		const path = getPath();
		if (!path) return null;
		activeController?.abort();
		const controller = new AbortController();
		activeController = controller;
		const signal = controller.signal;
		isLoading.value = true;
		try {
			if (kind === "get") {
				return (await useEntitiesStore().fetch(path, {
					signal,
				})) as ResultMap[K];
			}
			if (kind === "list")
				return (await FsClient.list(path, { signal })) as ResultMap[K];
			return (await FsClient.getBreadcrumbs(path, { signal })) as ResultMap[K];
		} finally {
			if (activeController === controller) activeController = null;
			isLoading.value = false;
		}
	}

	const { data, error, refresh } = await useAsyncData<ResultMap[K] | null>(
		() => `pf:${kind}:${getPath()}`,
		load,
		{ watch: [getPath], immediate: true, server: import.meta.server },
	);

	return {
		data: data as Ref<ResultMap[K] | null>,
		isLoading,
		error: error as Ref<unknown>,
		refresh: async () => {
			await refresh();
		},
	};
}
