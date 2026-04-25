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
	const { focus } = useFocusWindowController();

	const onPointerDown = (ev: PointerEvent) => {
		// Устанавливаем флаг изменения размера
		windowOb.states.resize = true;
		ev.preventDefault();

		// Синхронизируем calculated bounds с target перед началом resize
		syncBounds(windowOb);

		// Выходим из fullscreen и collapsed режимов
		delete windowOb.states.fullscreen;
		delete windowOb.states.collapsed;

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
			focus(windowOb.id);
			delete windowOb.states.resize;
			window.removeEventListener("pointermove", onPointerMove);
			window.removeEventListener("pointerup", onPointerUp);
		};

		window.addEventListener("pointermove", onPointerMove);
		window.addEventListener("pointerup", onPointerUp);
	};

	return { onPointerDown };
}
