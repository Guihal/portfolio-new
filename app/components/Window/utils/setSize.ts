import { useBoundsStore } from "~/stores/bounds";
import type { WindowOb } from "../types";
import { MINSIZE } from "./clampers";

/**
 * Устанавливает размер (width/height) с учётом минимального размера.
 *
 * @param windowOb - Объект окна
 * @param key - Какое свойство устанавливать ('width' or 'height')
 * @param value - Новое значение
 */
export function setSize(
	windowOb: WindowOb,
	key: "width" | "height",
	value: number,
) {
	const target = useBoundsStore().ensure(windowOb.id).target;
	// Clamp: не меньше MINSIZE
	target[key] = Math.max(MINSIZE, value);
}
