import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";
import { useBoundsStore } from "~/stores/bounds";

beforeEach(() => {
	setActivePinia(createPinia());
});

describe("bounds store", () => {
	it("ensure идемпотентен — тот же slot при повторном вызове", () => {
		const s = useBoundsStore();
		const a = s.ensure("1");
		const b = s.ensure("1");
		expect(a).toBe(b);
		expect(a.target).toBe(b.target);
	});

	it("setTarget мутирует target, calculated не трогается", () => {
		const s = useBoundsStore();
		s.setTarget("1", { left: 10, width: 200 });
		expect(s.bounds["1"]?.target.left).toBe(10);
		expect(s.bounds["1"]?.target.width).toBe(200);
		expect(s.bounds["1"]?.calculated.left).toBe(0);
		expect(s.bounds["1"]?.calculated.width).toBe(0);
	});

	it("syncCalculated копирует target в calculated", () => {
		const s = useBoundsStore();
		s.setTarget("1", { left: 10, top: 20, width: 300, height: 400 });
		s.syncCalculated("1");
		expect(s.bounds["1"]?.calculated).toEqual({
			left: 10,
			top: 20,
			width: 300,
			height: 400,
		});
	});

	it("syncCalculated несуществующего id — no-op", () => {
		const s = useBoundsStore();
		expect(() => s.syncCalculated("missing")).not.toThrow();
	});

	it("remove удаляет slot", () => {
		const s = useBoundsStore();
		s.ensure("1");
		s.remove("1");
		expect(s.bounds["1"]).toBeUndefined();
	});
});
