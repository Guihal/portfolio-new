import { useEntitiesStore } from "~/stores/entities";
import { useWindowsStore } from "~/stores/windows";
import { useWindowsUIStore } from "~/stores/windowsUI";
import type { FsFile } from "~~/shared/types/filesystem";
import type { WindowOb } from "../types";
import { useWindowLoading } from "./useWindowLoading";

const DEFAULT_ERR_MSG = "Не удалось открыть";

function isAbortError(err: unknown): boolean {
	if (!err || typeof err !== "object") return false;
	const e = err as {
		name?: string;
		kind?: string;
		cause?: { name?: string };
		message?: string;
	};
	// FsAbortedError → kind="aborted" (services/filesystem/errors.ts).
	if (e.kind === "aborted") return true;
	if (e.name === "AbortError" || e.name === "FsAbortedError") return true;
	if (e.cause?.name === "AbortError") return true;
	return Boolean(
		e.message?.includes("aborted") || e.message?.includes("signal is aborted"),
	);
}

function extractMsg(err: unknown): string {
	if (!err || typeof err !== "object") return DEFAULT_ERR_MSG;
	const e = err as { statusMessage?: string; message?: string };
	return e.statusMessage || e.message || DEFAULT_ERR_MSG;
}

/**
 * Слитый fetch для окна: грузит сущность по `windowRoute` и регистрирует
 * `isLoading` в global window-loading registry.
 *
 * P8-04: данные тянутся через `useEntitiesStore().fetch(path)` — shared cache
 * + in-flight dedup. Два окна на одинаковом path делят underlying request,
 * но per-window useAsyncData key (включает windowOb.id) сохраняет отдельный
 * Nuxt payload entry для SSR hydration. Stale Nuxt payload entries чистятся
 * per-route (watch на windowRoute) и per-window (onScopeDispose).
 */
export async function useFetchEntity(
	windowOb: WindowOb,
	windowRoute: Readonly<Ref<string>>,
) {
	const windowsStore = useWindowsStore();
	const uiStore = useWindowsUIStore();
	const entitiesStore = useEntitiesStore();

	const isNeedLoading = computed(() => {
		return (
			windowOb.file?.path !== windowOb.targetFile.value ||
			!windowOb.targetFile.value ||
			windowOb.targetFile.value !== windowRoute.value
		);
	});

	const inFlightCount = ref(0);
	const isLoading = ref(false);
	watch(
		inFlightCount,
		(v) => {
			isLoading.value = v > 0;
		},
		{ flush: "sync" },
	);

	const { register } = useWindowLoading();
	register(windowOb.id, isLoading);

	let activeController: AbortController | null = null;
	let disposed = false;
	onScopeDispose(() => {
		disposed = true;
		activeController?.abort();
		activeController = null;
		clearNuxtData(
			(k) =>
				typeof k === "string" && k.startsWith(`window-entity-${windowOb.id}-`),
		);
	});

	// Per-route cleanup: при навигации внутри окна освобождаем payload
	// предыдущего key, чтобы не накапливать stale entries.
	watch(windowRoute, (newRoute, oldRoute) => {
		if (oldRoute && oldRoute !== newRoute) {
			clearNuxtData(`window-entity-${windowOb.id}-${oldRoute}`);
		}
	});

	const { data, error } = await useAsyncData<FsFile | null>(
		() => `window-entity-${windowOb.id}-${windowRoute.value}`,
		async () => {
			if (disposed) return null;
			if (!isNeedLoading.value) return null;

			activeController?.abort();
			const controller = new AbortController();
			activeController = controller;

			inFlightCount.value++;
			try {
				return await entitiesStore.fetch(windowRoute.value, {
					signal: controller.signal,
				});
			} finally {
				inFlightCount.value--;
				if (activeController === controller) activeController = null;
			}
		},
		{
			watch: [isNeedLoading],
			immediate: true,
			server: import.meta.server,
		},
	);

	if (error.value && !isAbortError(error.value)) {
		uiStore.setError(windowOb.id, extractMsg(error.value));
	}

	watch(error, (newVal) => {
		if (!newVal) return;
		if (isAbortError(newVal)) return;
		uiStore.setError(windowOb.id, extractMsg(newVal));
	});

	watch(
		data,
		() => {
			if (!data.value) return;
			windowsStore.setFile(windowOb.id, data.value);
			// Symmetric к watch(error): успешный fetch очищает прошлую ошибку
			// если она задержалась (refresh без loading-transition cycle).
			uiStore.setError(windowOb.id, null);
		},
		{
			immediate: true,
		},
	);

	return {
		entity: data,
		isLoading,
		error,
	};
}
