import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";
import { useWindowsStore } from "~/stores/windows";
import { useWindowsUIStore } from "~/stores/windowsUI";
import type { FsFile } from "~~/shared/types/filesystem";

const file: FsFile = { name: "a", path: "/a", programType: "project" };

beforeEach(() => {
	setActivePinia(createPinia());
});

describe("windowsUI store — setError transactional contract", () => {
	it("setError(id, 'msg') → errors[id]='msg' + windows.states.error=true", () => {
		const ws = useWindowsStore();
		const ui = useWindowsUIStore();
		const w = ws.create(file);
		ui.setError(w.id, "404");
		expect(ui.getError(w.id)).toBe("404");
		expect(w.states.error).toBe(true);
	});

	it("setError(id, null) когда error=true → cleared (errors + states)", () => {
		const ws = useWindowsStore();
		const ui = useWindowsUIStore();
		const w = ws.create(file);
		ui.setError(w.id, "x");
		ui.setError(w.id, null);
		expect(ui.getError(w.id)).toBeUndefined();
		expect(w.states.error).toBeUndefined();
	});

	it("setError(id, null) когда error уже false → no churn", () => {
		const ws = useWindowsStore();
		const ui = useWindowsUIStore();
		const w = ws.create(file);
		ui.setError(w.id, null);
		expect(ui.getError(w.id)).toBeUndefined();
		expect(w.states.error).toBeUndefined();
	});

	it("setError несуществующего id — no-op", () => {
		const ui = useWindowsUIStore();
		expect(() => ui.setError("ghost", "x")).not.toThrow();
		expect(ui.getError("ghost")).toBeUndefined();
	});

	it("clear(id) убирает errors[id] (state не трогает)", () => {
		const ws = useWindowsStore();
		const ui = useWindowsUIStore();
		const w = ws.create(file);
		ui.setError(w.id, "x");
		ui.clear(w.id);
		expect(ui.getError(w.id)).toBeUndefined();
		// clear — низкоуровневый, состояние error остаётся (вызывается из
		// windows.ts cleanup пути или useRemoveWindow).
		expect(w.states.error).toBe(true);
	});

	it("$reset очищает все errors", () => {
		const ws = useWindowsStore();
		const ui = useWindowsUIStore();
		const w1 = ws.create(file);
		const w2 = ws.create({ ...file, path: "/b" });
		ui.setError(w1.id, "a");
		ui.setError(w2.id, "b");
		ui.$reset();
		expect(ui.getError(w1.id)).toBeUndefined();
		expect(ui.getError(w2.id)).toBeUndefined();
	});
});
