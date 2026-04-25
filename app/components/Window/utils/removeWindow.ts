import { useBoundsStore } from "~/stores/bounds";
import { useFrameStore } from "~/stores/frame";
import { useQueuedRouterStore } from "~/stores/queuedRouter";
import { useWindowsStore } from "~/stores/windows";
import { useWindowLoading } from "../composables/useWindowLoading";
import type { WindowOb } from "../types";

/**
 * Orchestrator: удаляет окно + каскад bounds/frame/loaders + router push("/")
 * если удалённое окно было сфокусированным.
 *
 * @param windowOb - Объект окна для удаления
 */
export function useRemoveWindow(windowOb: WindowOb) {
	const { unregister } = useWindowLoading();

	// Очистка loaders ДО bounds: watchEffect в initWindowLoading может читать loaders[id]
	unregister(windowOb.id);

	// Удаляем bounds + frame observer/image из соответствующих сторов
	useBoundsStore().remove(windowOb.id);
	useFrameStore().remove(windowOb.id);

	// Store возвращает wasFocused — orchestrator сбрасывает router если так.
	const wasFocused = useWindowsStore().remove(windowOb.id);
	if (wasFocused) useQueuedRouterStore().push("/");
}
