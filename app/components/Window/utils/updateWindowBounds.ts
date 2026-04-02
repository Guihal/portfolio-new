import type { WindowOb } from '../Window';
import {
    getTargetBounds,
    type WindowBoundsKey,
    type WindowBounds,
} from '~/composables/useWindowBounds';

export function useUpdateWindowBounds(windowOb: WindowOb) {
    return (targetBounds: WindowBounds) => {
        const target = getTargetBounds(windowOb.id);
        const keys: WindowBoundsKey[] = ['left', 'top', 'width', 'height'];
        for (const key of keys) {
            target[key] = targetBounds[key];
        }
    };
}
