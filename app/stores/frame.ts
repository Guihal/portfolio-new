import { defineStore, getActivePinia } from "pinia";
import { ref } from "vue";

/**
 * P8-06: чистый state-store для taskbar preview images.
 * DOM-логика (MutationObserver + html-to-image) вынесена в
 * `useWindowPreviewObserver` (composable, lifecycle-aware).
 */

/**
 * Test/HMR cleanup: сброс images map. На HMR module reload без этого
 * предыдущий store hold'ит stale data:url'ы.
 */
export function __resetFrameImages() {
	try {
		const pinia = getActivePinia();
		if (pinia) {
			useFrameStore().images = {};
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
		images.value[id] = src;
	}

	function remove(id: string) {
		Reflect.deleteProperty(images.value, id);
	}

	return { images, set, remove };
});
