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

export async function useWindowEntityFetcher(
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

	// Abort controller — ранняя регистрация onScopeDispose до первого await,
	// чтобы controller-leak был невозможен даже при abort parent scope во время fetch.
	let activeController: AbortController | null = null;
	let disposed = false;
	onScopeDispose(() => {
		disposed = true;
		activeController?.abort();
		activeController = null;
	});

	const { data, error } = await useAsyncData(
		() => `window-entity-${windowRoute.value}`,
		async () => {
			if (disposed) return null;
			if (!isNeedLoading.value) return null;

			// Abort previous in-flight request.
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
				// Balanced decrement (counter must not stuck) — ref writes post-dispose
				// безопасны: watchers уже unsubscribed, no side-effect.
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

	// Unified error handling: showError на каждую non-abort error-transition,
	// clearError когда данные восстановились.
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

	// Initial error (setup-level).
	if (error.value && !isAbortError(error.value)) {
		lastErrorWasFatal = true;
		triggerFatal();
	}

	// Subsequent error transitions.
	// Recovery (error→null) НЕ чистит global Nuxt error state — clearError затронул бы
	// чужие app-level ошибки (single-source инвариант не гарантирован). Юзер перезагрузит
	// страницу или навигация триггернёт reset.
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
}
