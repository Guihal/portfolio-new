// P8-07: pure positioning calc для taskbar tooltip.
// Вход — измеренные DOMRect/sizes от caller'а; внутри только арифметика.
// Tooltip позиционируется ПОВЕРХ target (top = target.top - tooltip.height),
// горизонтально центрируется относительно target и кламп'ится в viewport.

export type Vec2 = { top: number; left: number };
export type Size = { width: number; height: number };
export type RectLike = { top: number; left: number; width: number };

export type CalcTooltipPositionInput = {
	target: RectLike | null;
	tooltip: Size | null;
	viewportWidth: number;
};

/** Позиция тултипа относительно target без клампа. null target/tooltip → {0,0}. */
export function calcTooltipPosition(input: CalcTooltipPositionInput): Vec2 {
	const { target, tooltip } = input;
	if (!target || !tooltip) return { top: 0, left: 0 };
	const top = target.top - tooltip.height;
	const left = target.left + target.width / 2 - tooltip.width / 2;
	return { top, left };
}

/** Кламп tooltip.left в [0, viewportWidth - tooltip.width]. */
export function clampTooltipLeft(
	left: number,
	tooltipWidth: number,
	viewportWidth: number,
): number {
	const max = viewportWidth - tooltipWidth;
	return Math.max(Math.min(left, max), 0);
}

/** Композит calc + clamp — единая точка для caller'а. */
export function positionTooltip(input: CalcTooltipPositionInput): Vec2 {
	const { top, left } = calcTooltipPosition(input);
	const tooltipWidth = input.tooltip?.width ?? 0;
	return {
		top,
		left: clampTooltipLeft(left, tooltipWidth, input.viewportWidth),
	};
}
