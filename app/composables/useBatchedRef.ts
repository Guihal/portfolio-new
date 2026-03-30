export function useDebouncedMicrotaskRef(value) {
    let pending = false;

    return customRef((track, trigger) => {
        return {
            get() {
                track();
                return value;
            },
            set(newValue) {
                value = newValue; // обновляем сразу, но trigger не зовём

                if (!pending) {
                    pending = true;
                    queueMicrotask(() => {
                        pending = false;
                        trigger(); // один раз на все set() в этом тике
                    });
                }
            },
        };
    });
}
