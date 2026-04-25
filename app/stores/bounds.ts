import { defineStore } from "pinia";
import { markRaw, ref } from "vue";
import { useBatchedReactive } from "~/composables/useBatchedReactive";
import type { WindowBounds } from "~/composables/useWindowBounds";

type BoundsSlot = { target: WindowBounds; calculated: WindowBounds };

const emptyBounds = (): WindowBounds => ({
	left: 0,
	top: 0,
	width: 0,
	height: 0,
});

export const useBoundsStore = defineStore("bounds", () => {
	const bounds = ref<Record<string, BoundsSlot>>({});

	/** Idempotent: повторный вызов возвращает тот же reactive slot, подписки живут. */
	function ensure(id: string): BoundsSlot {
		const existing = bounds.value[id];
		if (existing) return existing;
		// markRaw: иначе Vue's outer reactive Proxy перехватывает set
		// синхронно и customRef-batched trigger (microtask) defeated.
		bounds.value[id] = {
			target: markRaw(useBatchedReactive(emptyBounds())),
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

	return { bounds, ensure, remove, setTarget, syncCalculated };
});
