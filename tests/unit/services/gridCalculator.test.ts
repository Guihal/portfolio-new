// P8-08 — pure unit tests для gridCalculator.
// Покрывает: happy path, 0×0, area < cellSize, cellSize <= 0, позиции 2x2.

import { describe, expect, it } from "vitest";
import { calcGrid } from "~/services/gridCalculator";

describe("calcGrid — happy path", () => {
	it("200×200 area, cellSize=40, gap=8 → 5x5 grid (gap-aware ceil)", () => {
		// step = 48, ceil((200+8)/48) = ceil(4.333) = 5.
		const r = calcGrid({
			areaWidth: 200,
			areaHeight: 200,
			cellSize: 40,
			gap: 8,
		});
		expect(r.cols).toBe(5);
		expect(r.rows).toBe(5);
		expect(r.total).toBe(25);
		expect(r.cells).toHaveLength(25);
	});

	it("preserves legacy ceil semantics with gap=0 (200/40=5)", () => {
		const r = calcGrid({
			areaWidth: 200,
			areaHeight: 120,
			cellSize: 40,
			gap: 0,
		});
		expect(r.cols).toBe(5);
		expect(r.rows).toBe(3);
		expect(r.total).toBe(15);
	});

	it("non-divisible area rounds up (legacy ceil): 201/40 → 6", () => {
		const r = calcGrid({
			areaWidth: 201,
			areaHeight: 40,
			cellSize: 40,
			gap: 0,
		});
		expect(r.cols).toBe(6);
		expect(r.rows).toBe(1);
	});
});

describe("calcGrid — edge cases", () => {
	it("areaWidth=0, areaHeight=0 → empty result", () => {
		const r = calcGrid({
			areaWidth: 0,
			areaHeight: 0,
			cellSize: 40,
			gap: 8,
		});
		expect(r).toEqual({ cols: 0, rows: 0, total: 0, cells: [] });
	});

	it("areaWidth=0, areaHeight>0 → empty (любая нулевая ось)", () => {
		const r = calcGrid({
			areaWidth: 0,
			areaHeight: 200,
			cellSize: 40,
			gap: 0,
		});
		expect(r.cols).toBe(0);
		expect(r.cells).toEqual([]);
	});

	it("negative area → empty", () => {
		const r = calcGrid({
			areaWidth: -10,
			areaHeight: 100,
			cellSize: 40,
			gap: 0,
		});
		expect(r.total).toBe(0);
		expect(r.cells).toEqual([]);
	});

	it("areaWidth < cellSize → 1 col (legacy ceil rounds up, NOT 0)", () => {
		// Внимание: спека P8-08 ожидала floor → 0, но legacy = ceil → 1.
		// Сохранение визуала Background/Workbench (см. report PR P8-08).
		const r = calcGrid({
			areaWidth: 30,
			areaHeight: 30,
			cellSize: 40,
			gap: 0,
		});
		expect(r.cols).toBe(1);
		expect(r.rows).toBe(1);
	});

	it("cellSize=0 → throws RangeError", () => {
		expect(() =>
			calcGrid({ areaWidth: 100, areaHeight: 100, cellSize: 0, gap: 0 }),
		).toThrow(RangeError);
	});

	it("cellSize<0 → throws RangeError", () => {
		expect(() =>
			calcGrid({ areaWidth: 100, areaHeight: 100, cellSize: -5, gap: 0 }),
		).toThrow(/cellSize/);
	});
});

describe("calcGrid — cell positions", () => {
	it("2×2 grid: cellSize=40, gap=10 → step=50", () => {
		// area=90 → ceil((90+10)/50)=2.
		const r = calcGrid({
			areaWidth: 90,
			areaHeight: 90,
			cellSize: 40,
			gap: 10,
		});
		expect(r.cols).toBe(2);
		expect(r.rows).toBe(2);
		expect(r.cells).toEqual([
			{ x: 0, y: 0 },
			{ x: 50, y: 0 },
			{ x: 0, y: 50 },
			{ x: 50, y: 50 },
		]);
	});

	it("2×2 grid с gap=0: позиции = c*cellSize / r*cellSize", () => {
		const r = calcGrid({
			areaWidth: 80,
			areaHeight: 80,
			cellSize: 40,
			gap: 0,
		});
		expect(r.cells).toEqual([
			{ x: 0, y: 0 },
			{ x: 40, y: 0 },
			{ x: 0, y: 40 },
			{ x: 40, y: 40 },
		]);
	});
});
