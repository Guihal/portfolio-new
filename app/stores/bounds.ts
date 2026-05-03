import { defineStore } from "pinia";
import { customRef, markRaw, type Ref, ref } from "vue";

export type WindowBounds = {
	left: number;
	top: number;
	width: number;
	height: number;
};

export type WindowBoundsKey = keyof WindowBounds;

export const CSS_VAR_KEYS: Record<WindowBoundsKey, string> = {
	left: "--w-left",
	top: "--w-top",
	width: "--w-width",
	height: "--w-height",
};

type BoundsSlot = { target: WindowBounds; calculated: WindowBounds };

const emptyBounds = (): WindowBounds => ({
	left: 0,
	top: 0,
	width: 0,
	height: 0,
});

/**
 * Microtask-batched reactive object: parallel writes within one task tick
 * coalesced into single trigger per key. Used for target bounds — drag/resize
 * loops fire many writes per frame, batching prevents redundant Vue re-renders.
 */
function createBatchedBounds(initial: WindowBounds): WindowBounds {
	let pending = false;
	const triggers = new Map<WindowBoundsKey, () => void>();
	const dirty = new Set<WindowBoundsKey>();
	const store = { ...initial };

	const refs = {} as { [K in WindowBoundsKey]: Ref<number> };

	const wrapRef = (k: WindowBoundsKey): Ref<number> =>
		customRef<number>((track, trigger) => {
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

	for (const key of Object.keys(initial) as WindowBoundsKey[]) {
		refs[key] = wrapRef(key);
	}

	return new Proxy(store, {
		get(_target, key) {
			if (key in refs) return refs[key as WindowBoundsKey].value;
			return Reflect.get(store, key);
		},
		set(_target, key, value) {
			if (key in refs) {
				refs[key as WindowBoundsKey].value = value;
				return true;
			}
			return Reflect.set(store, key, value);
		},
	}) as WindowBounds;
}

export const useBoundsStore = defineStore("bounds", () => {
	const bounds = ref<Record<string, BoundsSlot>>({});

	/** Idempotent: повторный вызов возвращает тот же reactive slot, подписки живут. */
	function ensure(id: string): BoundsSlot {
		const existing = bounds.value[id];
		if (existing) return existing;
		// markRaw: иначе Vue's outer reactive Proxy перехватывает set
		// синхронно и customRef-batched trigger (microtask) defeated.
		bounds.value[id] = {
			target: markRaw(createBatchedBounds(emptyBounds())),
			calculated: emptyBounds(),
		};
		return bounds.value[id] as BoundsSlot;
	}

	function remove(id: string) {
		Reflect.deleteProperty(bounds.value, id);
	}

	/**
	 * Auto-vivification: создаёт slot если нет. Вызывающий отвечает
	 * за то, что id соответствует существующему окну (иначе — ghost slot
	 * до windows.remove-orchestration в P2-03).
	 */
	function setTarget(id: string, partial: Partial<WindowBounds>) {
		Object.assign(ensure(id).target, partial);
	}

	function syncCalculated(id: string) {
		const slot = bounds.value[id];
		if (!slot) return;
		slot.calculated.left = slot.target.left;
		slot.calculated.top = slot.target.top;
		slot.calculated.width = slot.target.width;
		slot.calculated.height = slot.target.height;
	}

	function $reset() {
		bounds.value = {};
	}

	return { bounds, ensure, remove, setTarget, syncCalculated, $reset };
});
