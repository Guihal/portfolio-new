import { type Ref, watch } from "vue";
import { useWindowsStore } from "~/stores/windows";
import type { WindowOb } from "../types";

/**
 * Зеркалит локальный isLoading флаг (из useWindowLoading) в Pinia
 * window state, чтобы UI-консьюмеры могли реактивно читать через store.
 */
export function useLoadingStateSync(
	windowOb: WindowOb,
	isLoading: Ref<boolean>,
) {
	const windowsStore = useWindowsStore();
	watch(
		isLoading,
		() => {
			windowsStore.setState(windowOb.id, "loading", isLoading.value);
		},
		{ immediate: true },
	);
}
