import type { FsFile } from "~~/shared/types/filesystem";
import type { WindowOb } from "../types";
import { useWindowLoading } from "./useWindowLoading";

function isAbortError(err: unknown): boolean {
	if (!err || typeof err !== "object") return false;
	const e = err as {
		name?: string;
		cause?: { name?: string };
		message?: string;
	};
	if (e.name === "AbortError") return true;
	if (e.cause?.name === "AbortError") return true;
	if (
		e.message?.includes("aborted") ||
		e.message?.includes("signal is aborted")
	)
		return true;
	return false;
}

/**
 * Слитый fetch для окна: грузит сущность по `windowRoute` и регистрирует
 * `isLoading` в global window-loading registry. Заменяет
 * `useFetchWindowEntity` + `useWindowFetch`.
 */
export async function useFetchEntity(
	windowOb: WindowOb,
	windowRoute: Readonly<Ref<string>>,
) {
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
	});

	const { data, error } = await useAsyncData<FsFile | null>(
		() => `window-entity-${windowRoute.value}`,
		async () => {
			if (disposed) return null;
			if (!isNeedLoading.value) return null;

			activeController?.abort();
			const controller = new AbortController();
			activeController = controller;

			inFlightCount.value++;
			try {
				return await $fetch("/api/filesystem/get", {
					query: { path: windowRoute.value },
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

	const triggerFatal = () => {
		showError(
			createError({
				statusCode: 404,
				statusMessage: "Страница не найдена",
				fatal: true,
			}),
		);
	};

	let lastErrorWasFatal = false;

	if (error.value && !isAbortError(error.value)) {
		lastErrorWasFatal = true;
		triggerFatal();
	}

	watch(error, (newVal, oldVal) => {
		if (newVal === oldVal) return;
		if (!newVal) {
			lastErrorWasFatal = false;
			return;
		}
		if (isAbortError(newVal)) return;
		if (lastErrorWasFatal) return;
		lastErrorWasFatal = true;
		triggerFatal();
	});

	watch(
		data,
		() => {
			if (!data.value) return;
			windowOb.file = {
				...data.value,
			};
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
