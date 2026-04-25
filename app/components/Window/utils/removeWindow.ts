import { removeWindowBounds } from "~/composables/useWindowBounds";
import { useWindowLoading } from "../composables/useWindowLoading";
import type { WindowOb } from "../types";

/**
 * Удаляет окно из глобального хранилища allWindows.
 *
 * @param windowOb - Объект окна для удаления
 */
export function useRemoveWindow(windowOb: WindowOb) {
	const { allWindows } = useAllWindows();
	const { unregister } = useWindowLoading();

	// Очистка loaders ДО bounds: watchEffect в initWindowLoading может читать loaders[id]
	unregister(windowOb.id);

	// Удаляем bounds из глобального store
	removeWindowBounds(windowOb.id);

	// Удаляем окно по ID из реактивного хранилища
	const { [windowOb.id]: _removed, ...rest } = allWindows.value;
	allWindows.value = rest;
}
