import { useBoundsStore } from "~/stores/bounds";
import { useFocusStore } from "~/stores/focus";
import { useFrameStore } from "~/stores/frame";
import { useQueuedRouterStore } from "~/stores/queuedRouter";
import { useWindowsStore } from "~/stores/windows";
import { useWindowsUIStore } from "~/stores/windowsUI";
import { useWindowLoading } from "../composables/useWindowLoading";
import type { WindowOb } from "../types";

/**
 * Orchestrator: каскадно очищает loaders → bounds → frame → windows + сбрасывает
 * focus и router если удалённое окно было сфокусированным.
 *
 * @param windowOb - Объект окна для удаления
 */
export function useRemoveWindow(windowOb: WindowOb) {
	const { unregister } = useWindowLoading();
	const focusStore = useFocusStore();

	// Снимаем wasFocused ДО windows.remove (defensive read).
	const wasFocused = focusStore.focusedId === windowOb.id;

	// Очистка loaders ДО bounds: watchEffect в initWindowLoading может читать loaders[id]
	unregister(windowOb.id);

	// Удаляем bounds + frame observer/image + UI message из соответствующих сторов
	useBoundsStore().remove(windowOb.id);
	useFrameStore().remove(windowOb.id);
	useWindowsUIStore().clear(windowOb.id);

	const removed = useWindowsStore().remove(windowOb.id);
	if (removed && wasFocused) {
		focusStore.unFocus();
		useQueuedRouterStore().push("/");
	}
}
