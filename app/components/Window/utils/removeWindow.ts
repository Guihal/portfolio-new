import type { WindowOb } from '../Window';

/**
 * Удаляет окно из глобального хранилища allWindows.
 *
 * @param windowOb - Объект окна для удаления
 */
export function useRemoveWindow(windowOb: WindowOb) {
    const { allWindows } = useAllWindows();

    // Удаляем окно по ID из реактивного хранилища
    delete allWindows.value[windowOb.id];
}
