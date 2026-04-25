import { useBoundsStore } from "~/stores/bounds";
import { useFocusStore } from "~/stores/focus";
import type { WindowOb } from "../types";

export function useMove(windowOb: WindowOb) {
	const focusStore = useFocusStore();
	const target = useBoundsStore().ensure(windowOb.id).target;

	return (ev: PointerEvent) => {
		if (windowOb.states.fullscreen) return;
		focusStore.focus(windowOb.id);
		windowOb.states.drag = true;

		let lastX = ev.clientX;
		let lastY = ev.clientY;

		const pointerMove = (ev: PointerEvent) => {
			const deltaY = ev.clientY - lastY;
			const deltaX = ev.clientX - lastX;

			lastY = ev.clientY;
			lastX = ev.clientX;

			target.top += deltaY;
			target.left += deltaX;
		};

		const pointerup = () => {
			delete windowOb.states.drag;

			document.removeEventListener("pointermove", pointerMove);
			document.removeEventListener("pointerup", pointerup);
		};

		document.addEventListener("pointermove", pointerMove);
		document.addEventListener("pointerup", pointerup);
	};
}
