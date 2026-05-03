import { defineStore, getActivePinia } from "pinia";
import { ref } from "vue";

/**
 * P8-06: чистый state-store для taskbar preview images.
 * DOM-логика (MutationObserver + html-to-image) вынесена в
 * `useWindowPreviewObserver` (composable, lifecycle-aware).
 */

/**
 * Test/HMR cleanup: сброс images map. На HMR module reload без этого
 * предыдущий store hold'ит stale blob:URL'ы (browser-managed binary
 * memory не освобождается до revoke или document close).
 */
export function __resetFrameImages() {
	try {
		const pinia = getActivePinia();
		if (pinia) {
			const store = useFrameStore();
			for (const url of Object.values(store.images)) {
				if (url.startsWith("blob:")) URL.revokeObjectURL(url);
			}
			store.images = {};
		}
	} catch {
		// Pinia не инициализирован — OK (test env / module init order).
	}
}

if (import.meta.hot) {
	import.meta.hot.dispose(() => __resetFrameImages());
}

export const useFrameStore = defineStore("frame", () => {
	const images = ref<Record<string, string>>({});

	function set(id: string, src: string) {
		const prev = images.value[id];
		if (prev?.startsWith("blob:")) {
			URL.revokeObjectURL(prev);
		}
		images.value[id] = src;
	}

	function remove(id: string) {
		const prev = images.value[id];
		if (prev?.startsWith("blob:")) {
			URL.revokeObjectURL(prev);
		}
		Reflect.deleteProperty(images.value, id);
	}

	/**
	 * Revoke loop guarded `startsWith("blob:")` — PR-K coordination: после
	 * миграции на Blob URL `frame.images[id]` будет blob:URL, нужно явно
	 * освобождать. Guard защищает от mixed state (data:URL legacy / HMR).
	 */
	function $reset() {
		for (const url of Object.values(images.value)) {
			if (url.startsWith("blob:")) URL.revokeObjectURL(url);
		}
		images.value = {};
	}

	return { images, set, remove, $reset };
});
