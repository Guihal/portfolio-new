// P8-05 — drag logic для slider. Pointer events, threshold, direction.
// DOM access только через ref + onMounted guard. RULES.md §4.3: константы вынесены.

import { SLIDER_DRAG_THRESHOLD_PX } from "~/utils/constants/slider";

function attachPointerListeners(
	el: HTMLElement,
	onMove: (e: PointerEvent) => void,
	onUp: (e: PointerEvent) => void,
	pointerId: number,
): void {
	el.setPointerCapture(pointerId);
	el.addEventListener("pointermove", onMove);
	el.addEventListener("pointerup", onUp);
	el.addEventListener("pointercancel", onUp);
}

function detachPointerListeners(
	el: HTMLElement,
	onMove: (e: PointerEvent) => void,
	onUp: (e: PointerEvent) => void,
): void {
	el.removeEventListener("pointermove", onMove);
	el.removeEventListener("pointerup", onUp);
	el.removeEventListener("pointercancel", onUp);
}

export function useSliderDrag(
	root: Ref<HTMLElement | undefined>,
	onNext: () => void,
	onPrev: () => void,
) {
	const dragging = ref(false);
	let startX = 0;
	let moved = false;

	function onPointerDown(e: PointerEvent): void {
		if (!root.value) return;
		startX = e.clientX;
		moved = false;
		attachPointerListeners(root.value, onPointerMove, onPointerUp, e.pointerId);
	}

	function onPointerMove(e: PointerEvent): void {
		const dx = Math.abs(e.clientX - startX);
		if (dx > SLIDER_DRAG_THRESHOLD_PX) {
			moved = true;
			dragging.value = true;
		}
	}

	function onPointerUp(e: PointerEvent): void {
		if (!root.value) return;
		detachPointerListeners(root.value, onPointerMove, onPointerUp);

		const dx = e.clientX - startX;
		if (moved) {
			if (dx < -SLIDER_DRAG_THRESHOLD_PX) onNext();
			else if (dx > SLIDER_DRAG_THRESHOLD_PX) onPrev();
		}

		dragging.value = false;
	}

	onMounted(() => {
		const el = root.value;
		if (!el) return;
		el.addEventListener("pointerdown", onPointerDown);
	});

	onUnmounted(() => {
		const el = root.value;
		if (!el) return;
		el.removeEventListener("pointerdown", onPointerDown);
		el.removeEventListener("pointermove", onPointerMove);
		el.removeEventListener("pointerup", onPointerUp);
		el.removeEventListener("pointercancel", onPointerUp);
	});

	return { dragging: readonly(dragging) };
}
