import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useBoundsStore } from "~/stores/bounds";
import { useFocusStore } from "~/stores/focus";
import { useFrameStore } from "~/stores/frame";
import { useWindowsStore } from "~/stores/windows";
import type { FsFile } from "~~/shared/types/filesystem";

const file: FsFile = { name: "a", path: "/a", programType: "project" };
const file2: FsFile = { name: "b", path: "/b", programType: "explorer" };

beforeEach(() => {
	setActivePinia(createPinia());
});

describe("windows store", () => {
	it("create сохраняет окно, заполняет индексы", () => {
		const s = useWindowsStore();
		const w = s.create(file);
		expect(s.list).toHaveLength(1);
		expect(s.byId(w.id)).toBe(w);
		expect(s.byPath("/a")).toBe(w);
		expect(s.byProgram("project")).toHaveLength(1);
		expect(s.byProgram("explorer")).toHaveLength(0);
	});

	it("create со строкой → file=null, targetFile.value=path", () => {
		const s = useWindowsStore();
		const w = s.create("/only-path");
		expect(w.file).toBeNull();
		expect(w.targetFile.value).toBe("/only-path");
		expect(s.byPath("/only-path")).toBe(w);
	});

	it("focus/unFocus делегируются в focus store", () => {
		const s = useWindowsStore();
		const f = useFocusStore();
		const w = s.create(file);
		s.focus(w.id);
		expect(f.focusedId).toBe(w.id);
		s.unFocus();
		expect(f.focusedId).toBeNull();
	});

	it("remove сбрасывает focusedId если он совпадал", () => {
		const s = useWindowsStore();
		const f = useFocusStore();
		const w = s.create(file);
		s.focus(w.id);
		s.remove(w.id);
		expect(s.byId(w.id)).toBeUndefined();
		expect(f.focusedId).toBeNull();
	});

	it("remove несуществующего id — no-op", () => {
		const s = useWindowsStore();
		expect(() => s.remove("doesNotExist")).not.toThrow();
	});

	it("setState(id, key, true) ставит true, setState(…, false) удаляет", () => {
		const s = useWindowsStore();
		const w = s.create(file);
		s.setState(w.id, "focused", true);
		expect(w.states.focused).toBe(true);
		s.setState(w.id, "focused", false);
		expect(w.states.focused).toBeUndefined();
	});

	it("setState несуществующего id — no-op", () => {
		const s = useWindowsStore();
		expect(() => s.setState("ghost", "focused", true)).not.toThrow();
	});

	it("clearState — no-op синоним setState(id, key, false)", () => {
		const s = useWindowsStore();
		const w = s.create(file);
		s.setState(w.id, "focused", true);
		s.clearState(w.id, "focused");
		expect(w.states.focused).toBeUndefined();
	});

	it("clearState несуществующего ключа — no-op", () => {
		const s = useWindowsStore();
		const w = s.create(file);
		expect(() => s.clearState(w.id, "focused")).not.toThrow();
		expect(w.states.focused).toBeUndefined();
	});

	it("focus несуществующего id — не бросает (caller contract)", () => {
		const s = useWindowsStore();
		expect(() => s.focus("ghost")).not.toThrow();
	});

	it("double create того же path → 2 разных id, byPath возвращает первое", () => {
		const s = useWindowsStore();
		const w1 = s.create(file);
		const w2 = s.create(file);
		expect(w1.id).not.toBe(w2.id);
		expect(s.byPath("/a")).toBe(w1);
		expect(s.list).toHaveLength(2);
	});

	it("byPath для несуществующего пути → undefined", () => {
		const s = useWindowsStore();
		s.create(file2);
		expect(s.byPath("/nonexistent")).toBeUndefined();
	});

	describe("setState incompatibility table", () => {
		it("setState fullscreen=true очищает collapsed/drag/resize", () => {
			const s = useWindowsStore();
			const w = s.create(file);
			s.setState(w.id, "collapsed", true);
			s.setState(w.id, "drag", true);
			s.setState(w.id, "resize", true);
			s.setState(w.id, "fullscreen", true);
			expect(w.states.fullscreen).toBe(true);
			expect(w.states.collapsed).toBeUndefined();
			expect(w.states.drag).toBeUndefined();
			expect(w.states.resize).toBeUndefined();
		});

		it("setState collapsed=true очищает fullscreen/drag/resize", () => {
			const s = useWindowsStore();
			const w = s.create(file);
			s.setState(w.id, "fullscreen", true);
			s.setState(w.id, "drag", true);
			s.setState(w.id, "resize", true);
			s.setState(w.id, "collapsed", true);
			expect(w.states.collapsed).toBe(true);
			expect(w.states.fullscreen).toBeUndefined();
			expect(w.states.drag).toBeUndefined();
			expect(w.states.resize).toBeUndefined();
		});

		it("setState drag=true очищает fullscreen/collapsed (resize не трогает)", () => {
			const s = useWindowsStore();
			const w = s.create(file);
			s.setState(w.id, "fullscreen", true);
			s.setState(w.id, "drag", true);
			expect(w.states.drag).toBe(true);
			expect(w.states.fullscreen).toBeUndefined();
		});

		it("setState resize=true очищает fullscreen/collapsed (drag не трогает)", () => {
			const s = useWindowsStore();
			const w = s.create(file);
			s.setState(w.id, "collapsed", true);
			s.setState(w.id, "resize", true);
			expect(w.states.resize).toBe(true);
			expect(w.states.collapsed).toBeUndefined();
		});

		it("setState focused=true НЕ очищает другие states (вне таблицы)", () => {
			const s = useWindowsStore();
			const w = s.create(file);
			s.setState(w.id, "fullscreen", true);
			s.setState(w.id, "focused", true);
			expect(w.states.focused).toBe(true);
			expect(w.states.fullscreen).toBe(true);
		});

		it("setState value=false не триггерит INCOMPATIBLE clears", () => {
			const s = useWindowsStore();
			const w = s.create(file);
			s.setState(w.id, "collapsed", true);
			s.setState(w.id, "fullscreen", false);
			expect(w.states.collapsed).toBe(true);
			expect(w.states.fullscreen).toBeUndefined();
		});

		it("toggleState переключает state", () => {
			const s = useWindowsStore();
			const w = s.create(file);
			s.toggleState(w.id, "fullscreen");
			expect(w.states.fullscreen).toBe(true);
			s.toggleState(w.id, "fullscreen");
			expect(w.states.fullscreen).toBeUndefined();
		});

		it("toggleState fullscreen применяет INCOMPATIBLE table", () => {
			const s = useWindowsStore();
			const w = s.create(file);
			s.setState(w.id, "collapsed", true);
			s.toggleState(w.id, "fullscreen");
			expect(w.states.fullscreen).toBe(true);
			expect(w.states.collapsed).toBeUndefined();
		});

		it("toggleState несуществующего id — no-op", () => {
			const s = useWindowsStore();
			expect(() => s.toggleState("ghost", "fullscreen")).not.toThrow();
		});
	});

	// Контрактный тест: фиксирует deferred cross-store cleanup (TODO P2-03).
	// Пока консюмеры не мигрированы, windows.remove НЕ трогает bounds/frame.
	// Орфан-slot bounds[id] ожидается жить до явного вызова boundsStore.remove.
	it("remove пока НЕ чистит bounds/frame (P2-03 orchestration)", () => {
		const w = useWindowsStore();
		const b = useBoundsStore();
		const f = useFrameStore();
		const win = w.create(file);
		b.setTarget(win.id, { left: 10 });
		f.set(win.id, "data:x");
		w.remove(win.id);
		expect(b.bounds[win.id]).toBeDefined();
		expect(f.images[win.id]).toBe("data:x");
	});

	describe("setError", () => {
		it("setError(id, 'msg') → states.error=true, errorMessage='msg'", () => {
			const s = useWindowsStore();
			const w = s.create(file);
			s.setError(w.id, "404");
			expect(w.states.error).toBe(true);
			expect(w.errorMessage).toBe("404");
		});

		it("setError(id, null) когда error=true → cleared", () => {
			const s = useWindowsStore();
			const w = s.create(file);
			s.setError(w.id, "x");
			s.setError(w.id, null);
			expect(w.states.error).toBeUndefined();
			expect(w.errorMessage).toBeUndefined();
		});

		it("setError(id, null) когда error уже false → no churn", () => {
			const s = useWindowsStore();
			const w = s.create(file);
			// initial state: error undefined, errorMessage undefined.
			s.setError(w.id, null);
			expect(w.states.error).toBeUndefined();
			expect(w.errorMessage).toBeUndefined();
		});

		it("setError несуществующего id — no-op", () => {
			const s = useWindowsStore();
			expect(() => s.setError("ghost", "x")).not.toThrow();
		});
	});

	describe("INCOMPATIBLE error/loading", () => {
		it("setState(loading,true) когда error=true → error+errorMessage сброшены", () => {
			const s = useWindowsStore();
			const w = s.create(file);
			s.setError(w.id, "msg");
			s.setState(w.id, "loading", true);
			expect(w.states.error).toBeUndefined();
			expect(w.errorMessage).toBeUndefined();
			expect(w.states.loading).toBe(true);
		});

		it("setState(error,true) когда loading=true → loading остаётся (one-way)", () => {
			const s = useWindowsStore();
			const w = s.create(file);
			s.setState(w.id, "loading", true);
			s.setState(w.id, "error", true);
			expect(w.states.error).toBe(true);
			expect(w.states.loading).toBe(true);
		});

		it("clearState(id,'error') → error+errorMessage сброшены", () => {
			const s = useWindowsStore();
			const w = s.create(file);
			s.setError(w.id, "x");
			s.clearState(w.id, "error");
			expect(w.states.error).toBeUndefined();
			expect(w.errorMessage).toBeUndefined();
		});

		it("setState(id,'error',false) → error+errorMessage сброшены", () => {
			const s = useWindowsStore();
			const w = s.create(file);
			s.setError(w.id, "x");
			s.setState(w.id, "error", false);
			expect(w.states.error).toBeUndefined();
			expect(w.errorMessage).toBeUndefined();
		});
	});

	describe("remove + focus reset (store contract)", () => {
		it("remove(focusedId) → focusedId=null + return true", () => {
			const s = useWindowsStore();
			const f = useFocusStore();
			const w = s.create(file);
			s.focus(w.id);
			const wasFocused = s.remove(w.id);
			expect(f.focusedId).toBeNull();
			expect(wasFocused).toBe(true);
		});

		it("remove(non-focusedId) → focusedId не сбрасывается + return false", () => {
			const s = useWindowsStore();
			const f = useFocusStore();
			const w1 = s.create(file);
			const w2 = s.create(file2);
			s.focus(w1.id);
			const wasFocused = s.remove(w2.id);
			expect(f.focusedId).toBe(w1.id);
			expect(wasFocused).toBe(false);
		});

		it("remove несуществующего id → return false", () => {
			const s = useWindowsStore();
			expect(s.remove("ghost")).toBe(false);
		});

		it("remove когда нет фокуса → return false", () => {
			const s = useWindowsStore();
			const w = s.create(file);
			expect(s.remove(w.id)).toBe(false);
		});
	});
});
