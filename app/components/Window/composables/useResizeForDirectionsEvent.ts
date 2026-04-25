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
		// setState 'resize' автоматически clear fullscreen/collapsed через
		// INCOMPATIBLE table в windows store.
		windowsStore.setState(windowOb.id, "resize", true);
		ev.preventDefault();

		// Синхронизируем calculated bounds с target перед началом resize
		syncBounds(windowOb);

		// Захватываем pointer для элемента (чтобы события шли даже за пределами)
		(ev.target as HTMLElement).setPointerCapture(ev.pointerId);

		// Обработчик перемещения
		const onPointerMove = (ev: PointerEvent) => {
			// Вычисляем новые размеры для активных осей
			if ("left" in controlled || "right" in controlled) {
				const key = "left" in controlled ? "left" : "right";
				controlled[key](ev.clientX, ev.clientY);
			}
			if ("top" in controlled || "bottom" in controlled) {
				const key = "top" in controlled ? "top" : "bottom";
				controlled[key](ev.clientX, ev.clientY);
			}
		};

		// Обработчик отпускания
		const onPointerUp = () => {
			focusStore.focus(windowOb.id);
			windowsStore.clearState(windowOb.id, "resize");
			window.removeEventListener("pointermove", onPointerMove);
			window.removeEventListener("pointerup", onPointerUp);
		};

		window.addEventListener("pointermove", onPointerMove);
		window.addEventListener("pointerup", onPointerUp);
	};

	return { onPointerDown };
}
