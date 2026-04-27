import { useContentAreaStore } from "~/stores/contentArea";

/**
 * Регистрирует ResizeObserver на documentElement и пишет размеры в contentAreaStore.viewport.
 * Idempotent через store-флаг — повторный вызов безопасен.
 * Должен вызываться в setup() (использует onMounted/onBeforeUnmount).
 */
export const useViewportObserver = () => {
	if (!import.meta.client) return;

	onMounted(() => {
		const store = useContentAreaStore();
		if (store.viewportObserverInitialised) return;
		store.markViewportObserverInitialised();

		const element = document.documentElement;
		if (!element) return;

		const observer = new ResizeObserver((entries) => {
			const rect = entries[0]?.contentRect;
			if (!rect) return;
			store.setViewport({ width: rect.width, height: rect.height });
		});

		observer.observe(element);

		onBeforeUnmount(() => observer.disconnect());
	});
};

/**
 * Регистрирует ResizeObserver на переданном элементе таскбара и обновляет
 * contentAreaStore.taskbarHeight. Idempotent через store-флаг.
 */
export const useTaskbarObserver = (elementRef: Ref<HTMLElement | null>) => {
	if (!import.meta.client) return;

	onMounted(() => {
		const store = useContentAreaStore();
		if (store.taskbarObserverInitialised) return;
		store.markTaskbarObserverInitialised();

		if (!elementRef.value) return;

		const observer = new ResizeObserver((entries) => {
			const height = entries[0]?.contentRect.height;
			if (height === undefined) return;
			store.setTaskbarHeight(height);
		});

		observer.observe(elementRef.value);
		onBeforeUnmount(() => observer.disconnect());
	});
};
