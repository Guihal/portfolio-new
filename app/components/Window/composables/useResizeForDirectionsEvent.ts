import { useFocusStore } from "~/stores/focus";
import { useWindowsStore } from "~/stores/windows";
import type { WindowOb } from "../types";
import { syncBounds } from "../utils/syncBounds";
import {
	type ChainedKey,
	useResizeForDirections,
} from "./useResizeForDirections";

/**
 * Обработчик pointer-событий для изменения размера окна.
 *
 * Логика:
 * 1. При pointerdown — устанавливает состояние resize, синхронизирует bounds
 * 2. При pointermove — вычисляет новые размеры для активных направлений
 * 3. При pointerup — снимает состояние resize
 *
 * @param windowOb - Объект окна
 * @param directions - Направления для изменения размера (top, bottom, left, right)
 */
export function useResizeForDirectionsEvent(
	windowOb: WindowOb,
	directions: ChainedKey[],
) {
	// Получаем функции для вычисления размеров по направлениям
	const controlled = useResizeForDirections(windowOb, directions);
	const focusStore = useFocusStore();
	const windowsStore = useWindowsStore();

	const onPointerDown = (ev: PointerEvent) => {
		// Re-entrance guard ДО setState — иначе setState→true сразу делает
		// последующий self-guard через тот же state бесполезным.
		if (windowOb.states.resize) return;
		const el = ev.currentTarget as HTMLElement | null;
		// SSR/jsdom guard: setPointerCapture отсутствует → resize недоступен.
		if (!el?.setPointerCapture) return;

		// setState 'resize' автоматически clear fullscreen/collapsed через
		// INCOMPATIBLE table в windows store.
		windowsStore.setState(windowOb.id, "resize", true);
		ev.preventDefault();

		// Синхронизируем calculated bounds с target перед началом resize
		syncBounds(windowOb);

		// Capture на capturing element (el = currentTarget): pointermove идёт
		// к el даже за пределами окна, и второй pointerdown с другого pointer
		// получит свой capture без orphan'ов на window.
		el.setPointerCapture(ev.pointerId);

		const ctrl = new AbortController();
		const { signal } = ctrl;

		el.addEventListener(
			"pointermove",
			(ev: PointerEvent) => {
				// Вычисляем новые размеры для активных осей
				if ("left" in controlled || "right" in controlled) {
					const key = "left" in controlled ? "left" : "right";
					controlled[key](ev.clientX, ev.clientY);
				}
				if ("top" in controlled || "bottom" in controlled) {
					const key = "top" in controlled ? "top" : "bottom";
					controlled[key](ev.clientX, ev.clientY);
				}
			},
			{ signal },
		);

		// abort ПОСЛЕДНЯЯ строка: focus/clearState завершаются ДО listener
		// removal, повторный fire (lostpointercapture после pointerup) — no-op.
		const end = () => {
			focusStore.focus(windowOb.id);
			windowsStore.clearState(windowOb.id, "resize");
			ctrl.abort();
		};
		el.addEventListener("pointerup", end, { signal });
		el.addEventListener("pointercancel", end, { signal });
		el.addEventListener("lostpointercapture", end, { signal });
	};

	return { onPointerDown };
}
