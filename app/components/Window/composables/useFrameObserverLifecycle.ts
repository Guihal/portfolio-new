import { onMounted, onUnmounted } from "vue";
import { useFrameStore } from "~/stores/frame";
import type { WindowOb } from "../types";

/**
 * Lifecycle: при mount — initial focus + create frame observer; при unmount —
 * destroy observer. Router/focus reset при закрытии окна — orchestrator
 * useRemoveWindow (см. utils/removeWindow.ts).
 */
export function useFrameObserverLifecycle(
	windowOb: WindowOb,
	focusWindow: () => void,
) {
	const frameStore = useFrameStore();
	onMounted(() => {
		focusWindow();
		frameStore.createObserver(windowOb);
	});
	onUnmounted(() => {
		frameStore.destroyObserver(windowOb.id);
	});
}
