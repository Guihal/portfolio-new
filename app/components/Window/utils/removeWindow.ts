import type { WindowOb } from '../Window';
import { removeWindowBounds } from '~/composables/useWindowBounds';

/**
 * Удаляет окно из глобального хранилища allWindows.
 *
 * @param windowOb - Объект окна для удаления
 */
export function useRemoveWindow(windowOb: WindowOb) {
    const { allWindows } = useAllWindows();

    // Удаляем bounds из глобального store
    removeWindowBounds(windowOb.id);

    // Удаляем окно по ID из реактивного хранилища
    delete allWindows.value[windowOb.id];
}
