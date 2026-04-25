// P0-06: clamp handlers для width/height/top/left против MINSIZE + content bounds.
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";
import type { WindowOb } from "~/components/Window/types";
import { clampHandlers, MINSIZE } from "~/components/Window/utils/clampers";
import { useBoundsStore } from "~/stores/bounds";

beforeEach(() => {
	setActivePinia(createPinia());
	// clampers.top/left читают target.height/width окна через store
	useBoundsStore().setTarget("w1", { width: 400, height: 400 });
});

const win = { id: "w1" } as unknown as WindowOb;

describe("clampHandlers.width", () => {
	it("ниже MINSIZE → MINSIZE", () => {
		expect(clampHandlers.width?.(100, win, 1000, 800)).toBe(MINSIZE);
	});
	it("выше cw → cw", () => {
		expect(clampHandlers.width?.(2000, win, 1000, 800)).toBe(1000);
	});
	it("в пределах → value", () => {
		expect(clampHandlers.width?.(600, win, 1000, 800)).toBe(600);
	});
});

describe("clampHandlers.height", () => {
	it("ниже MINSIZE → MINSIZE", () => {
		expect(clampHandlers.height?.(50, win, 1000, 800)).toBe(MINSIZE);
	});
	it("выше ch → ch", () => {
		expect(clampHandlers.height?.(9999, win, 1000, 800)).toBe(800);
	});
});

describe("clampHandlers.top", () => {
	it("отрицательный → 0", () => {
		expect(clampHandlers.top?.(-50, win, 1000, 800)).toBe(0);
	});
	it("выше ch - MINSIZE → clamp", () => {
		expect(clampHandlers.top?.(9999, win, 1000, 800)).toBe(800 - MINSIZE);
	});
});

describe("clampHandlers.left", () => {
	it("отрицательный → 0", () => {
		expect(clampHandlers.left?.(-10, win, 1000, 800)).toBe(0);
	});
	it("выше cw - MINSIZE → clamp", () => {
		expect(clampHandlers.left?.(9999, win, 1000, 800)).toBe(1000 - MINSIZE);
	});
});
