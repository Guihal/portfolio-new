import { useBatchedReactive } from './useBatchedReactive';

export type WindowBounds = {
    left: number;
    top: number;
    width: number;
    height: number;
};

export type WindowBoundsKey = keyof WindowBounds;

export const CSS_VAR_KEYS: Record<WindowBoundsKey, string> = {
    left: '--w-left',
    top: '--w-top',
    width: '--w-width',
    height: '--w-height',
};

const targetStores = new Map<string, WindowBounds>();
const calculatedStores = new Map<string, WindowBounds>();

function createReactiveStore(): WindowBounds {
    return useBatchedReactive({ left: 0, top: 0, width: 0, height: 0 });
}

function createPlainStore(): WindowBounds {
    return { left: 0, top: 0, width: 0, height: 0 };
}

export function getTargetBounds(id: string): WindowBounds {
    if (!targetStores.has(id)) {
        targetStores.set(id, createReactiveStore());
    }
    return targetStores.get(id)!;
}

export function getCalculatedBounds(id: string): WindowBounds {
    if (!calculatedStores.has(id)) {
        calculatedStores.set(id, createPlainStore());
    }
    return calculatedStores.get(id)!;
}

export function removeWindowBounds(id: string) {
    targetStores.delete(id);
    calculatedStores.delete(id);
}

export function useWindowBounds(id: string) {
    return {
        target: getTargetBounds(id),
        calculated: getCalculatedBounds(id),
    };
}
