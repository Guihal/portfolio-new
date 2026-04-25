import { defineStore, getActivePinia } from "pinia";
import { ref } from "vue";
import type { WindowOb } from "~/components/Window/types";
import { debounce } from "~/utils/debounce";
import { useBoundsStore } from "./bounds";

/**
 * Client-only store. На SSR `observers === null`, createObserver — noop.
 * В unit-тестах вызывай __resetFrameObservers() в before/afterEach для изоляции.
 */
const observers: Map<string, MutationObserver> | null = import.meta.client
	? new Map()
	: null;

/**
 * Test/HMR cleanup: disconnect все observers + reset images store state.
 * На HMR module reload без этого старые observers держат refs на удалённый
 * DOM, а images.value содержит stale data:url'ы.
 */
export function __resetFrameObservers() {
	if (observers) {
		for (const o of observers.values()) o.disconnect();
		observers.clear();
	}
	try {
		const pinia = getActivePinia();
		if (pinia) {
			const store = useFrameStore();
			store.images = {};
		}
	} catch {
		// Pinia не инициализирован — OK (test env / module init order).
	}
}

if (import.meta.hot) {
	import.meta.hot.dispose(() => __resetFrameObservers());
}

export const useFrameStore = defineStore("frame", () => {
	const images = ref<Record<string, string>>({});

	function set(id: string, src: string) {
		images.value[id] = src;
	}

	function remove(id: string) {
		Reflect.deleteProperty(images.value, id);
		destroyObserver(id);
	}

	function createObserver(windowOb: WindowOb) {
		if (!import.meta.client || !observers) return;
		if (observers.has(windowOb.id)) return;
		const el = document.getElementById(`window-${windowOb.id}`);
		if (!el) return;
		const wrapper = el.querySelector<HTMLElement>(".window__wrapper");
		if (!wrapper) return;
		const content = el.querySelector<HTMLElement>(".window__content");
		if (!content) return;

		const slot = useBoundsStore().ensure(windowOb.id);
		const isAlive = () => observers?.has(windowOb.id) === true;
		const shouldSkip = () =>
			windowOb.states.drag ||
			windowOb.states.resize ||
			windowOb.states.collapsed;
		const generateImage = debounce(async () => {
			if (!import.meta.client) return;
			// Guard перед любой async работой: observer мог быть уничтожен между debounce и вызовом.
			if (!isAlive() || shouldSkip()) return;
			try {
				// Dynamic import: html-to-image использует DOM API, ломает SSR на top-level.
				const htmlToImage = await import("html-to-image");
				// Race-guard после await: destroyObserver мог сработать, пока грузился chunk.
				if (!isAlive() || shouldSkip()) return;
				const jpeg = await htmlToImage.toJpeg(wrapper, {
					width: slot.calculated.width,
					height: slot.calculated.height,
					cacheBust: true,
					quality: 1,
				});
				// Финальный guard после toJpeg (может занять >100ms): не воскрешаем удалённую запись.
				if (!isAlive()) return;
				images.value[windowOb.id] = jpeg;
			} catch {
				// html-to-image падает на невидимых — игнор
			}
		}, 500);

		const observer = new MutationObserver(() => generateImage());
		observer.observe(content, { childList: true, subtree: true });
		observers.set(windowOb.id, observer);
		generateImage();
	}

	function destroyObserver(id: string) {
		if (!import.meta.client || !observers) return;
		const ob = observers.get(id);
		if (ob) {
			ob.disconnect();
			observers.delete(id);
		}
		Reflect.deleteProperty(images.value, id);
	}

	return { images, set, remove, createObserver, destroyObserver };
});
