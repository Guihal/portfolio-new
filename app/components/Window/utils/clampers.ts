import type { WindowOb } from '../Window';
import {
    getTargetBounds,
    type WindowBoundsKey,
} from '~/composables/useWindowBounds';

// Минимальный размер окна (ширина/высота)
export const MINSIZE = 320;

/**
 * Функции ограничения (clamp) для свойств окна.
 *
 * Каждая функция принимает:
 * - value: новое значение свойства
 * - windowOb: объект окна (для доступа к другим свойствам)
 * - cw, ch: ширина и высота контентной области
 *
 * Возвращает значение в допустимых пределах.
 */
export const clampHandlers: Record<string, ClampFn> = {
    // Ограничение top: [0, contentHeight - minHeight]
    top: (v, windowOb, _cw, ch) => {
        const target = getTargetBounds(windowOb.id);
        return Math.max(0, Math.min(v, ch - Math.min(target.height, MINSIZE)));
    },

    // Ограничение left: [0, contentWidth - minWidth]
    left: (v, windowOb, cw, ch) => {
        const target = getTargetBounds(windowOb.id);
        return Math.max(0, Math.min(v, cw - Math.min(target.width, MINSIZE)));
    },

    // Ограничение width: [MINSIZE, contentWidth]
    width: (v, windowOb, cw, ch) =>
        Math.max(MINSIZE, Math.min(v, Math.min(v, cw))),

    // Ограничение height: [MINSIZE, contentHeight]
    height: (v, windowOb, cw, ch) => Math.max(MINSIZE, Math.min(v, ch)),
};

export type ClampFn = (
    value: number,
    bounds: WindowOb,
    cw: number, // content width
    ch: number, // content height
) => number;
