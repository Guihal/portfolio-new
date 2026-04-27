import { onMounted, onUnmounted } from "vue";
import type { WindowOb } from "../types";
import { useWindowPreviewObserver } from "./useWindowPreviewObserver";

/**
 * Lifecycle: при mount — initial focus + start preview observer; при unmount —
 * stop observer (через cleanup из useWindowPreviewObserver). Router/focus
 * reset при закрытии окна — orchestrator useRemoveWindow (см. utils/removeWindow.ts).
 */
export function useFrameObserverLifecycle(
	windowOb: WindowOb,
	focusWindow: () => void,
) {
	let cleanup: (() => void) | null = null;
	onMounted(() => {
		focusWindow();
		cleanup = useWindowPreviewObserver(windowOb);
	});
	onUnmounted(() => {
		cleanup?.();
		cleanup = null;
	});
}
