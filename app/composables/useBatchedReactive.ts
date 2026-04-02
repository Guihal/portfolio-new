import { customRef, type Ref } from 'vue';

export function useBatchedReactive<T extends object>(initial: T): T {
    let pending = false;
    const triggers = new Map<PropertyKey, () => void>();
    const dirty = new Set<PropertyKey>();
    const store = { ...initial };

    const refs = {} as { [K in keyof T]: Ref<T[keyof T]> };

    for (const key of Object.keys(initial) as (keyof T)[]) {
        refs[key] = customRef<T[keyof T]>((track, trigger) => {
            triggers.set(key, trigger);
            return {
                get() {
                    track();
                    return store[key];
                },
                set(newValue) {
                    if (Object.is(newValue, store[key])) return;
                    store[key] = newValue;
                    dirty.add(key);

                    if (!pending) {
                        pending = true;
                        queueMicrotask(() => {
                            pending = false;
                            for (const key of dirty) {
                                triggers.get(key)?.();
                            }
                            dirty.clear();
                        });
                    }
                },
            };
        });
    }

    return new Proxy(store, {
        get(_target, key) {
            if (key === '_refs') return refs;
            if (key in refs) return refs[key as keyof T].value;
            return Reflect.get(store, key);
        },
        set(_target, key, value) {
            if (key in refs) {
                refs[key as keyof T].value = value;
                return true;
            }
            return Reflect.set(store, key, value);
        },
    }) as T;
}
