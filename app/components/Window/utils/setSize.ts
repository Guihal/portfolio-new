import { getTargetBounds } from "~/composables/useWindowBounds";
import type { WindowOb } from "../types";
import { MINSIZE } from "./clampers";

/**
 * Устанавливает размер (width/height) с учётом минимального размера.
 *
 * @param windowOb - Объект окна
 * @param key - Какое свойство устанавливать ('width' или 'height')
 * @param value - Новое значение
 */
export function setSize(
	windowOb: WindowOb,
	key: "width" | "height",
	value: number,
) {
	const target = getTargetBounds(windowOb.id);
	// Clamp: не меньше MINSIZE
	target[key] = Math.max(MINSIZE, value);
}
