import { customRef, type Ref } from 'vue';

export function useBatchedRef<T>(initial: T): Ref<T> {
    let value = initial;
    let pending = false;

    return customRef<T>((track, trigger) => ({
        get() {
            track();
            return value;
        },
        set(newValue: T) {
            if (Object.is(newValue, value)) return;

            value = newValue;

            if (!pending) {
                pending = true;
                queueMicrotask(() => {
                    pending = false;
                    trigger();
                });
            }
        },
    }));
}
