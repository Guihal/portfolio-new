import type { TemplateRef } from "vue";

export type Cell = {
	width: number;
	height: number;
};

export type CellsInElement = {
	x: number;
	y: number;
};

/**
 * Вычисляет сетку ячеек для элемента на основе его размеров.
 * Использует ResizeObserver для отслеживания изменений размера.
 *
 * Логика:
 * 1. При изменении размера элемента — пересчитывает количество ячеек
 * 2. Вычисляет реальный размер ячеек (elementSize / cellsCount)
 *
 * @param element - Ref на DOM-элемент
 * @param preferredCell - Желаемый размер ячейки (для расчёта количества)
 */
export function useGridCells(
	element: TemplateRef<HTMLElement | null>,
	preferredCell: Cell,
) {
	// Текущие размеры элемента
	const elementBounds: Ref<{
		width: number;
		height: number;
	}> = ref({
		width: 0,
		height: 0,
	});

	// Количество ячеек по осям X и Y
	const cellsInElement: CellsInElement = reactive({
		x: 0,
		y: 0,
	});

	/**
	 * Реальный размер одной ячейки.
	 * Если ячеек 0 — возвращает preferredCell.
	 */
	const realCell: ComputedRef<Cell> = computed(() => {
		if (cellsInElement.x === 0 || cellsInElement.y === 0) {
			return {
				width: preferredCell.width,
				height: preferredCell.height,
			};
		}

		// Делим размеры элемента на количество ячеек
		return {
			width: elementBounds.value.width / cellsInElement.x,
			height: elementBounds.value.height / cellsInElement.y,
		};
	});

	// Вычисляет размеры элемента и количество ячеек
	const calculateCells = () => {
		if (!element.value) return;

		const bounds = element.value.getBoundingClientRect();
		elementBounds.value.width = bounds.width;
		elementBounds.value.height = bounds.height;

		// Округляем вверх до ближайшего целого числа ячеек
		cellsInElement.x = Math.ceil(
			elementBounds.value.width / preferredCell.width,
		);
		cellsInElement.y = Math.ceil(
			elementBounds.value.height / preferredCell.height,
		);
	};

	// ResizeObserver — single instance per composable scope;
	// re-subscribe disconnect'ит предыдущий, onScopeDispose на уровне setup.
	let resizeObserver: ResizeObserver | null = null;

	const subscribe = () => {
		if (!import.meta.client) return;
		if (!element.value) {
			logger.error("useGridCells: Элемент не найден");
			return;
		}
		calculateCells();
		resizeObserver?.disconnect();
		resizeObserver = new ResizeObserver(calculateCells);
		resizeObserver.observe(element.value);
	};

	onScopeDispose(() => {
		resizeObserver?.disconnect();
		resizeObserver = null;
	});

	return {
		subscribe,
		realCell,
		cellsInElement,
		elementBounds,
	};
}
