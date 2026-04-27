import { useBoundsStore, type WindowBoundsKey } from "~/stores/bounds";
import type { WindowOb } from "../../types";

/**
 * Сохраняет bounds окна при сворачивании и восстанавливает при разворачивании.
 *
 * Watch на flip `states.collapsed`:
 * - false → true: запоминает текущие width/height/top/left.
 * - true → false: восстанавливает запомнённые значения в bounds.target.
 *
 * Mutates: bounds.target (left/top/width/height).
 */
export function useCollapseBoundsMemory(windowOb: WindowOb): void {
	const target = useBoundsStore().ensure(windowOb.id).target;

	const beforeCollapsedBounds = ref<Record<WindowBoundsKey, number>>({
		width: 0,
		height: 0,
		top: 0,
		left: 0,
	});

	watch(
		() => windowOb.states.collapsed === true,
		(value, lastValue) => {
			if (lastValue === false && value === true) {
				beforeCollapsedBounds.value = {
					left: target.left,
					top: target.top,
					width: target.width,
					height: target.height,
				};
			}

			if (value === false) {
				target.left = beforeCollapsedBounds.value.left;
				target.top = beforeCollapsedBounds.value.top;
				target.width = beforeCollapsedBounds.value.width;
				target.height = beforeCollapsedBounds.value.height;
			}
		},
		{
			immediate: true,
		},
	);
}
