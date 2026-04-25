// P0-06: clamp handlers для width/height/top/left против MINSIZE + content bounds.
import { describe, expect, it, vi } from "vitest";

vi.mock("~/composables/useWindowBounds", () => ({
	getTargetBounds: () => ({ width: 400, height: 400 }),
}));

import type { WindowOb } from "~/components/Window/types";
import { clampHandlers, MINSIZE } from "~/components/Window/utils/clampers";

const win = { id: "w1" } as unknown as WindowOb;

describe("clampHandlers.width", () => {
	it("ниже MINSIZE → MINSIZE", () => {
		expect(clampHandlers.width!(100, win, 1000, 800)).toBe(MINSIZE);
	});
	it("выше cw → cw", () => {
		expect(clampHandlers.width!(2000, win, 1000, 800)).toBe(1000);
	});
	it("в пределах → value", () => {
		expect(clampHandlers.width!(600, win, 1000, 800)).toBe(600);
	});
});

describe("clampHandlers.height", () => {
	it("ниже MINSIZE → MINSIZE", () => {
		expect(clampHandlers.height!(50, win, 1000, 800)).toBe(MINSIZE);
	});
	it("выше ch → ch", () => {
		expect(clampHandlers.height!(9999, win, 1000, 800)).toBe(800);
	});
});

describe("clampHandlers.top", () => {
	it("отрицательный → 0", () => {
		expect(clampHandlers.top!(-50, win, 1000, 800)).toBe(0);
	});
	it("выше ch - MINSIZE → clamp", () => {
		expect(clampHandlers.top!(9999, win, 1000, 800)).toBe(800 - MINSIZE);
	});
});

describe("clampHandlers.left", () => {
	it("отрицательный → 0", () => {
		expect(clampHandlers.left!(-10, win, 1000, 800)).toBe(0);
	});
	it("выше cw - MINSIZE → clamp", () => {
		expect(clampHandlers.left!(9999, win, 1000, 800)).toBe(1000 - MINSIZE);
	});
});
