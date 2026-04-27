import type { TemplateRef } from "vue";
import { calcGrid } from "~/services/gridCalculator";

export type Cell = { width: number; height: number };
export type CellsInElement = { x: number; y: number };

// Сколько ячеек размером `size` помещается в `area` (legacy ceil, gap=0).
const axis = (area: number, size: number) =>
	calcGrid({ areaWidth: area, areaHeight: 1, cellSize: size, gap: 0 }).cols;

/**
 * Vue-обёртка над `calcGrid`: ResizeObserver + refs (RULES.md §2b/§4.2).
 * `realCell` — растянутый размер ячейки (elementSize / cellsCount).
 */
export function useGridCells(el: TemplateRef<HTMLElement | null>, pref: Cell) {
	const elementBounds = ref({ width: 0, height: 0 });
	const cellsInElement: CellsInElement = reactive({ x: 0, y: 0 });
	const realCell: ComputedRef<Cell> = computed(() =>
		cellsInElement.x && cellsInElement.y
			? {
					width: elementBounds.value.width / cellsInElement.x,
					height: elementBounds.value.height / cellsInElement.y,
				}
			: pref,
	);
	const recalc = () => {
		if (!el.value) return;
		const { width, height } = el.value.getBoundingClientRect();
		elementBounds.value = { width, height };
		cellsInElement.x = axis(width, pref.width);
		cellsInElement.y = axis(height, pref.height);
	};
	let ro: ResizeObserver | null = null;
	const subscribe = () => {
		if (!import.meta.client) return;
		if (!el.value) return logger.error("useGridCells: Элемент не найден");
		recalc();
		ro?.disconnect();
		ro = new ResizeObserver(recalc);
		ro.observe(el.value);
	};
	onScopeDispose(() => {
		ro?.disconnect();
		ro = null;
	});
	return { subscribe, realCell, cellsInElement, elementBounds };
}
