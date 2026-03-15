import type { WindowBounds, WindowOb } from '../Window';

export type SetBoundsBounds = Partial<Record<keyof WindowBounds, number>>;

const minSize = 320;

export function setTargetBounds(widnowOb: WindowOb, bounds: SetBoundsBounds) {
    for (const key in bounds) {
        const typedKey = key as keyof SetBoundsBounds;
        // @ts-ignore
        widnowOb.boundsTarget[typedKey] = bounds[typedKey];
    }
}
