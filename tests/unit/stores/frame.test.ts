import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { WindowOb, WindowStates } from "~/components/Window/types";
import { __resetFrameObservers, useFrameStore } from "~/stores/frame";

const makeWindow = (id: string): WindowOb => ({
	id,
	states: {} as WindowStates,
	targetFile: { value: `/p/${id}` },
	file: null,
});

beforeEach(() => {
	setActivePinia(createPinia());
	__resetFrameObservers();
});

afterEach(() => {
	__resetFrameObservers();
});

describe("frame store", () => {
	it("set/remove images", () => {
		const s = useFrameStore();
		s.set("1", "data:image/x");
		expect(s.images["1"]).toBe("data:image/x");
		s.remove("1");
		expect(s.images["1"]).toBeUndefined();
	});

	it("createObserver без DOM-узла window-* — noop", () => {
		const s = useFrameStore();
		s.createObserver(makeWindow("ghost"));
		expect(s.images.ghost).toBeUndefined();
	});

	it("destroyObserver несуществующего id — no-op", () => {
		const s = useFrameStore();
		expect(() => s.destroyObserver("ghost")).not.toThrow();
	});

	it("createObserver в node-env (observers=null) безопасен, images остаются пустыми", () => {
		// В vitest без jsdom `import.meta.client` false → createObserver ранний return.
		// Фиксирует contract: никакой race-запись не может произойти в SSR-фазе.
		const s = useFrameStore();
		s.createObserver(makeWindow("w1"));
		expect(s.images.w1).toBeUndefined();
		s.destroyObserver("w1");
		expect(s.images.w1).toBeUndefined();
	});
});
