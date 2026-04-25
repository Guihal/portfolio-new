import { useBoundsStore, type WindowBoundsKey } from "~/stores/bounds";
import type { WindowOb } from "../types";

/**
 * Синхронизирует calculated bounds с target.
 * Используется перед началом resize для предотвращения скачков анимации.
 *
 * @param windowOb - Объект окна
 */
export function syncBounds(windowOb: WindowOb) {
	const slot = useBoundsStore().ensure(windowOb.id);
	const { target, calculated } = slot;

	const keys: WindowBoundsKey[] = ["left", "top", "width", "height"];

	for (const key of keys) {
		// Копируем текущие (анимированные) значения в целевые
		target[key] = calculated[key];
	}
}
