import { defineStore } from "pinia";
import { computed, ref } from "vue";

/**
 * Hydration note: на SSR viewport={0,0}. Консюмер обязан либо рендерить
 * area-dependent UI только на client (`<ClientOnly>` / `onMounted`), либо
 * использовать CSS v-show вместо v-if, чтобы избежать hydration mismatch.
 */
export const useContentAreaStore = defineStore("contentArea", () => {
	const viewport = ref({ width: 0, height: 0 });
	const taskbarHeight = ref(0);
	const viewportObserverInitialised = ref(false);
	const taskbarObserverInitialised = ref(false);

	const area = computed(() => ({
		width: Math.max(0, viewport.value.width),
		height: Math.max(0, viewport.value.height - taskbarHeight.value),
	}));

	function setViewport(rect: { width: number; height: number }) {
		viewport.value.width = rect.width;
		viewport.value.height = rect.height;
	}

	function setTaskbarHeight(h: number) {
		taskbarHeight.value = h;
	}

	function markViewportObserverInitialised() {
		viewportObserverInitialised.value = true;
	}

	function markTaskbarObserverInitialised() {
		taskbarObserverInitialised.value = true;
	}

	function $reset() {
		viewport.value = { width: 0, height: 0 };
		taskbarHeight.value = 0;
		viewportObserverInitialised.value = false;
		taskbarObserverInitialised.value = false;
	}

	return {
		viewport,
		taskbarHeight,
		viewportObserverInitialised,
		taskbarObserverInitialised,
		area,
		setViewport,
		setTaskbarHeight,
		markViewportObserverInitialised,
		markTaskbarObserverInitialised,
		$reset,
	};
});
