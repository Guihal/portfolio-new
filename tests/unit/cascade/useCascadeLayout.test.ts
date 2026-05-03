import { describe, expect, it } from "vitest";
import {
	type CascadeLayout,
	computeCascadeBounds,
} from "~/composables/useCascadeLayout";

describe("computeCascadeBounds — cascade", () => {
	it("idx 0 — origin", () => {
		const b = computeCascadeBounds("cascade", 0, { width: 1280, height: 800 });
		expect(b).toEqual({ left: 0, top: 0, width: 900, height: 620 });
	});

	it("idx 2 — diagonal offset 24x14 * 2", () => {
		const b = computeCascadeBounds("cascade", 2, { width: 1280, height: 800 });
		expect(b).toEqual({ left: 48, top: 28, width: 900, height: 620 });
	});

	it("idx 4 — каскад продолжает накопление сдвига", () => {
		const b = computeCascadeBounds("cascade", 4, { width: 1280, height: 800 });
		expect(b.left).toBe(96);
		expect(b.top).toBe(56);
		expect(b.width).toBe(900);
		expect(b.height).toBe(620);
	});
});

describe("computeCascadeBounds — tile-h", () => {
	const viewport = { width: 1200, height: 800 };

	it("idx 0 — левая половина viewport", () => {
		const b = computeCascadeBounds("tile-h", 0, viewport);
		expect(b).toEqual({ left: 0, top: 0, width: 592, height: 800 });
	});

	it("idx 1 — правая половина с gap", () => {
		const b = computeCascadeBounds("tile-h", 1, viewport);
		expect(b).toEqual({ left: 608, top: 0, width: 592, height: 800 });
	});

	it("узкий viewport — half клампится в 0 (не уходит в минус)", () => {
		const b = computeCascadeBounds("tile-h", 0, { width: 8, height: 600 });
		expect(b.width).toBe(0);
		expect(b.height).toBe(600);
	});
});

describe("computeCascadeBounds — typing", () => {
	it("layout type narrow", () => {
		const layouts: CascadeLayout[] = ["cascade", "tile-h"];
		for (const l of layouts) {
			const b = computeCascadeBounds(l, 0, { width: 1000, height: 700 });
			expect(b).toBeTruthy();
		}
	});
});
