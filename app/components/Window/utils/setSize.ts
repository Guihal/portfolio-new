import type { WindowOb } from '../Window';
import { MINSIZE } from './clampers';

/**
 * Устанавливает размер (width/height) с учётом минимального размера.
 *
 * @param windowOb - Объект окна
 * @param key - Какое свойство устанавливать ('width' или 'height')
 * @param value - Новое значение
 */
export function setSize(
    windowOb: WindowOb,
    key: 'width' | 'height',
    value: number,
) {
    // Clamp: не меньше MINSIZE
    windowOb.bounds.target[key] = Math.max(MINSIZE, value);
}
