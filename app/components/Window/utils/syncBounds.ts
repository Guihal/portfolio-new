import type { WindowOb } from '../Window';
import {
    getTargetBounds,
    getCalculatedBounds,
    type WindowBoundsKey,
} from '~/composables/useWindowBounds';

/**
 * Синхронизирует calculated bounds с target.
 * Используется перед началом resize для предотвращения скачков анимации.
 *
 * @param windowOb - Объект окна
 */
export function syncBounds(windowOb: WindowOb) {
    const target = getTargetBounds(windowOb.id);
    const calculated = getCalculatedBounds(windowOb.id);

    const keys: WindowBoundsKey[] = ['left', 'top', 'width', 'height'];

    for (const key of keys) {
        // Копируем текущие (анимированные) значения в целевые
        target[key] = calculated[key];
    }
}
