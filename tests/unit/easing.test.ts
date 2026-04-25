// P3-04: easeTowards — чистая функция easing для bounds-анимации.
import { describe, expect, it } from "vitest";
import { easeTowards } from "~/components/Window/composables/useWindowBoundsAnimation/easing";

describe("easeTowards", () => {
	it("при coeff=0.9 (non-interacting), 16ms — продвигает ~10% дельты", () => {
		const next = easeTowards(0, 100, 16, false);
		expect(next).toBeCloseTo(10, 1);
	});

	it("при coeff=0.6 (interacting), 16ms — продвигает ~40% дельты", () => {
		const next = easeTowards(0, 100, 16, true);
		expect(next).toBeCloseTo(40, 1);
	});

	it("current === target → возвращает то же значение", () => {
		expect(easeTowards(50, 50, 16, false)).toBe(50);
	});

	it("отрицательная дельта — приближение работает в обратном направлении", () => {
		const next = easeTowards(100, 0, 16, false);
		expect(next).toBeCloseTo(90, 1);
	});

	it("больший deltaMs → больший прогресс за вызов", () => {
		const small = easeTowards(0, 100, 16, false);
		const big = easeTowards(0, 100, 32, false);
		expect(big).toBeGreaterThan(small);
	});
});
