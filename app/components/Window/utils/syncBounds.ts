import type { WindowBounds, WindowOb } from '../Window';

/**
 * Синхронизирует calculated bounds с target.
 * Используется перед началом resize для предотвращения скачков анимации.
 *
 * @param windowOb - Объект окна
 */
export function syncBounds(windowOb: WindowOb) {
    for (const key in windowOb.boundsCalculated) {
        const typedKey = key as keyof WindowBounds;

        // Копируем текущие (анимированные) значения в целевые
        windowOb.boundsTarget[typedKey] = windowOb.boundsCalculated[typedKey];
    }
}
