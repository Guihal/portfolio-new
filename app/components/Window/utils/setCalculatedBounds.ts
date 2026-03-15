import type { WindowBounds, WindowOb } from '../Window';

export type SetBoundsBounds = Partial<Record<keyof WindowBounds, number>>;

export function setCalculatedBounds(
    widnowOb: WindowOb,
    bounds: SetBoundsBounds,
) {
    for (const key in bounds) {
        const typedKey = key as keyof SetBoundsBounds;
        // @ts-ignore
        widnowOb.boundsTarget[typedKey] = bounds[typedKey];
    }
}
