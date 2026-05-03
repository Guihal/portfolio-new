import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";
import { __resetFrameImages, useFrameStore } from "~/stores/frame";

beforeEach(() => {
	setActivePinia(createPinia());
	__resetFrameImages();
});

describe("frame store (P8-06: state-only)", () => {
	it("set/remove images", () => {
		const s = useFrameStore();
		s.set("1", "data:image/x");
		expect(s.images["1"]).toBe("data:image/x");
		s.remove("1");
		expect(s.images["1"]).toBeUndefined();
	});

	it("remove несуществующего id — no-op (не падает)", () => {
		const s = useFrameStore();
		expect(() => s.remove("ghost")).not.toThrow();
	});

	it("set перезаписывает существующее значение", () => {
		const s = useFrameStore();
		s.set("1", "data:a");
		s.set("1", "data:b");
		expect(s.images["1"]).toBe("data:b");
	});

	it("__resetFrameImages чистит state", () => {
		const s = useFrameStore();
		s.set("1", "x");
		s.set("2", "y");
		__resetFrameImages();
		expect(s.images).toEqual({});
	});
});
