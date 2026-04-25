import { useBoundsStore } from "~/stores/bounds";
import { useFrameStore } from "~/stores/frame";
import { useWindowsStore } from "~/stores/windows";
import { useWindowLoading } from "../composables/useWindowLoading";
import type { WindowOb } from "../types";

/**
 * Удаляет окно из глобального хранилища allWindows + каскад bounds/frame/loaders.
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

	// Удаляем окно по ID из windows-стора (focus сбрасывается внутри store)
	useWindowsStore().remove(windowOb.id);
}
