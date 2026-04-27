import { describe, expect, it } from "vitest";
import {
	calcTooltipPosition,
	clampTooltipLeft,
	positionTooltip,
} from "~/services/tooltipState";

describe("calcTooltipPosition", () => {
	it("null target → {0,0}", () => {
		expect(
			calcTooltipPosition({
				target: null,
				tooltip: { width: 100, height: 50 },
				viewportWidth: 1024,
			}),
		).toEqual({ top: 0, left: 0 });
	});

	it("null tooltip → {0,0} (ещё не измерен ResizeObserver'ом)", () => {
		expect(
			calcTooltipPosition({
				target: { top: 800, left: 100, width: 40 },
				tooltip: null,
				viewportWidth: 1024,
			}),
		).toEqual({ top: 0, left: 0 });
	});

	it("tooltip над target, центрирован по горизонтали", () => {
		// target: x=100, w=40 → center=120; tooltip w=200 → left=120-100=20.
		// top: target.top=800, tooltip.h=50 → 800-50=750.
		expect(
			calcTooltipPosition({
				target: { top: 800, left: 100, width: 40 },
				tooltip: { width: 200, height: 50 },
				viewportWidth: 1024,
			}),
		).toEqual({ top: 750, left: 20 });
	});
});

describe("clampTooltipLeft", () => {
	it("в границах — возвращает как есть", () => {
		expect(clampTooltipLeft(100, 200, 1024)).toBe(100);
	});

	it("отрицательный left → 0", () => {
		expect(clampTooltipLeft(-50, 200, 1024)).toBe(0);
	});

	it("выезжает за правый край → max - tooltipWidth", () => {
		// viewport=1024, tooltipWidth=200, входное left=900 → cap'ится в 1024-200=824.
		expect(clampTooltipLeft(900, 200, 1024)).toBe(824);
	});

	it("tooltipWidth > viewport — clamp возвращает 0 (Math.min(in, neg) → neg, потом max(neg, 0) → 0)", () => {
		expect(clampTooltipLeft(50, 1500, 1024)).toBe(0);
	});
});

describe("positionTooltip — composite", () => {
	it("happy path: tooltip помещается в viewport — без клампа", () => {
		expect(
			positionTooltip({
				target: { top: 800, left: 500, width: 40 },
				tooltip: { width: 200, height: 50 },
				viewportWidth: 1024,
			}),
		).toEqual({ top: 750, left: 420 });
	});

	it("target у левого края — клампится в 0", () => {
		expect(
			positionTooltip({
				target: { top: 800, left: 10, width: 40 },
				tooltip: { width: 200, height: 50 },
				viewportWidth: 1024,
			}),
		).toEqual({ top: 750, left: 0 });
	});

	it("target у правого края — клампится в max", () => {
		expect(
			positionTooltip({
				target: { top: 800, left: 1000, width: 40 },
				tooltip: { width: 200, height: 50 },
				viewportWidth: 1024,
			}),
		).toEqual({ top: 750, left: 824 });
	});
});
