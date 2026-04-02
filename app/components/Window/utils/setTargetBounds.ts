import type { WindowOb } from '../Window';
import {
    getTargetBounds,
    type WindowBoundsKey,
} from '~/composables/useWindowBounds';

export type SetBoundsBounds = Partial<Record<WindowBoundsKey, number>>;

export function setTargetBounds(windowOb: WindowOb, bounds: SetBoundsBounds) {
    const target = getTargetBounds(windowOb.id);
    for (const key in bounds) {
        const typedKey = key as WindowBoundsKey;
        target[typedKey] = bounds[typedKey]!;
    }
}
