import type { WindowOb, WindowBounds } from '../Window';

export function useUpdateWindowBounds(windowOb: WindowOb) {
    return (targetBounds: WindowBounds) => {
        for (const key in windowOb.boundsTarget) {
            const typedKey = key as keyof WindowBounds;
            windowOb.boundsTarget[typedKey] = targetBounds[typedKey];
        }
    };
}
