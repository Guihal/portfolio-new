import { defineStore } from "pinia";
import { computed, ref } from "vue";

export const useFocusStore = defineStore("focus", () => {
	const focusedId = ref<string | null>(null);

	/**
	 * Вызывать в setup() один раз на id, не в render — иначе на каждый
	 * рендер создаётся новый computed (утечка подписок).
	 */
	const isFocused = (id: string) => computed(() => focusedId.value === id);

	/** Caller responsibility: id must reference an existing window. */
	function focus(id: string) {
		if (focusedId.value === id) return;
		focusedId.value = id;
	}

	function unFocus() {
		focusedId.value = null;
	}

	function $reset() {
		focusedId.value = null;
	}

	return { focusedId, isFocused, focus, unFocus, $reset };
});
