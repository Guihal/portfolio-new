import { storeToRefs } from "pinia";
import { useContentAreaStore } from "~/stores/contentArea";

export type ContentAreaObj = {
	width: number;
	height: number;
};

export type ContentArea = Ref<ContentAreaObj>;

export const useContentArea = () => {
	const store = useContentAreaStore();
	const { area: contentArea } = storeToRefs(store);

	const setViewportObserver = () => {
		if (!import.meta.client) return;
		if (store.viewportObserverInitialised) return;
		store.markViewportObserverInitialised();

		onMounted(() => {
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

	const setTaskbarObserver = (elementRef: Ref<HTMLElement | null>) => {
		if (!import.meta.client) return;
		if (store.taskbarObserverInitialised) return;
		store.markTaskbarObserverInitialised();

		onMounted(() => {
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

	return { contentArea, setTaskbarObserver, setViewportObserver };
};
