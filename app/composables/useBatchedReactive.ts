import { customRef, type Ref } from "vue";

export function useBatchedReactive<T extends object>(initial: T): T {
	let pending = false;
	const triggers = new Map<PropertyKey, () => void>();
	const dirty = new Set<PropertyKey>();
	const store = { ...initial };

	const refs = {} as { [K in keyof T]: Ref<T[K]> };

	// Per-key helper — изолирует `K` для точного Ref<T[K]> вместо Ref<T[keyof T]> union.
	const wrapRef = <K extends keyof T>(k: K): Ref<T[K]> =>
		customRef<T[K]>((track, trigger) => {
			triggers.set(k, trigger);
			return {
				get() {
					track();
					return store[k];
				},
				set(newValue) {
					if (Object.is(newValue, store[k])) return;
					store[k] = newValue;
					dirty.add(k);

					if (!pending) {
						pending = true;
						queueMicrotask(() => {
							pending = false;
							for (const dk of dirty) {
								triggers.get(dk)?.();
							}
							dirty.clear();
						});
					}
				},
			};
		});

	for (const key of Object.keys(initial) as (keyof T)[]) {
		refs[key] = wrapRef(key);
	}

	return new Proxy(store, {
		get(_target, key) {
			if (key === "_refs") return refs;
			if (key in refs) return refs[key as keyof T].value;
			return Reflect.get(store, key);
		},
		set(_target, key, value) {
			if (key in refs) {
				refs[key as keyof T].value = value;
				return true;
			}
			// Unknown key (не из initial): write-through без customRef/debounce.
			// Документированное ограничение — dynamic-key writes не batched.
			return Reflect.set(store, key, value);
		},
	}) as T;
}
