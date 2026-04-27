// P8-08 — pure cell-grid calculator.
// Извлечён из useGridCells.ts:63-77 (см. RULES.md §2b/§4.2, anti-pattern §5).
//
// Замечание о математике: спека P8-08 предписывала Math.floor, однако
// существующий `useGridCells` использовал `Math.ceil(area / cellSize)`
// без учёта gap. Чтобы избежать визуальной регрессии в `Background.vue`
// и `Workbench/index.vue`, сохраняем `Math.ceil`-семантику. С `gap=0`
// формула `ceil((area + gap) / (cellSize + gap))` идентична исходному
// `ceil(area / cellSize)`. С положительным gap получаем gap-aware ceil.

export type GridInput = {
	areaWidth: number;
	areaHeight: number;
	cellSize: number;
	gap: number;
};

export type GridCell = {
	x: number;
	y: number;
};

export type GridResult = {
	cols: number;
	rows: number;
	total: number;
	cells: GridCell[];
};

function axisCount(area: number, cellSize: number, gap: number): number {
	if (area <= 0) return 0;
	return Math.ceil((area + gap) / (cellSize + gap));
}

/**
 * Чистая функция: считает количество ячеек и их позиции для прямоугольной
 * области. Без Vue, DOM и module-scope state — безопасно для SSR.
 *
 * @throws RangeError если cellSize <= 0.
 */
export function calcGrid(input: GridInput): GridResult {
	const { areaWidth, areaHeight, cellSize, gap } = input;

	if (cellSize <= 0) {
		throw new RangeError("cellSize must be > 0");
	}

	const cols = axisCount(areaWidth, cellSize, gap);
	const rows = axisCount(areaHeight, cellSize, gap);

	if (cols === 0 || rows === 0) {
		return { cols: 0, rows: 0, total: 0, cells: [] };
	}

	const step = cellSize + gap;
	const cells: GridCell[] = [];
	for (let r = 0; r < rows; r++) {
		for (let c = 0; c < cols; c++) {
			cells.push({ x: c * step, y: r * step });
		}
	}

	return { cols, rows, total: cols * rows, cells };
}
