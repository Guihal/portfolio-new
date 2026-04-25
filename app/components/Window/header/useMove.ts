import { useBoundsStore } from "~/stores/bounds";
import { useFocusStore } from "~/stores/focus";
import { useWindowsStore } from "~/stores/windows";
import type { WindowOb } from "../types";

export function useMove(windowOb: WindowOb) {
	const focusStore = useFocusStore();
	const windowsStore = useWindowsStore();
	const target = useBoundsStore().ensure(windowOb.id).target;

	return (ev: PointerEvent) => {
		if (windowOb.states.fullscreen) return;
		// Re-entrance guard: drag уже активен — игнорируем второй pointerdown
		// (multi-touch / fast double-press → orphan listener pair'ы).
		if (windowOb.states.drag) return;
		const el = ev.currentTarget as HTMLElement | null;
		// SSR/jsdom guard: setPointerCapture отсутствует → drag недоступен.
		if (!el?.setPointerCapture) return;

		el.setPointerCapture(ev.pointerId);

		focusStore.focus(windowOb.id);
		windowsStore.setState(windowOb.id, "drag", true);

		const ctrl = new AbortController();
		const { signal } = ctrl;
		let lastX = ev.clientX;
		let lastY = ev.clientY;

		el.addEventListener(
			"pointermove",
			(e: PointerEvent) => {
				target.top += e.clientY - lastY;
				target.left += e.clientX - lastX;
				lastY = e.clientY;
				lastX = e.clientX;
			},
			{ signal },
		);

		// abort ПОСЛЕДНЯЯ строка: clearState завершается ДО listener removal,
		// последующие fire (lostpointercapture после pointerup) — no-op.
		const end = () => {
			windowsStore.clearState(windowOb.id, "drag");
			ctrl.abort();
		};
		el.addEventListener("pointerup", end, { signal });
		el.addEventListener("pointercancel", end, { signal });
		el.addEventListener("lostpointercapture", end, { signal });
	};
}
