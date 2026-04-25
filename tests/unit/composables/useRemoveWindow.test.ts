import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { WindowOb, WindowStates } from "~/components/Window/types";
import { useRemoveWindow } from "~/components/Window/utils/removeWindow";
import { useBoundsStore } from "~/stores/bounds";
import { useFocusStore } from "~/stores/focus";
import { __resetFrameObservers, useFrameStore } from "~/stores/frame";
import { useWindowsStore } from "~/stores/windows";
import type { FsFile } from "~~/shared/types/filesystem";

const file: FsFile = { name: "a", path: "/a", programType: "project" };
const file2: FsFile = { name: "b", path: "/b", programType: "explorer" };

let pushMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
	pushMock = vi.fn().mockResolvedValue(undefined);
	(
		globalThis as unknown as { useRouter: () => { push: typeof pushMock } }
	).useRouter = () => ({ push: pushMock });
	setActivePinia(createPinia());
	__resetFrameObservers();
});

afterEach(() => {
	__resetFrameObservers();
});

describe("useRemoveWindow orchestrator", () => {
	it("focused window → focus reset + router.push('/')", () => {
		const w = useWindowsStore();
		const f = useFocusStore();
		const win = w.create(file);
		f.focus(win.id);

		useRemoveWindow(win);

		expect(w.byId(win.id)).toBeUndefined();
		expect(f.focusedId).toBeNull();
		expect(pushMock).toHaveBeenCalledTimes(1);
		expect(pushMock).toHaveBeenCalledWith("/");
	});

	it("non-focused window → focus сохраняется, router НЕ push", () => {
		const w = useWindowsStore();
		const f = useFocusStore();
		const w1 = w.create(file);
		const w2 = w.create(file2);
		f.focus(w1.id);

		useRemoveWindow(w2);

		expect(w.byId(w2.id)).toBeUndefined();
		expect(f.focusedId).toBe(w1.id);
		expect(pushMock).not.toHaveBeenCalled();
	});

	it("ghost id (window не зарегистрирован в store) → no-op для focus/router", () => {
		const f = useFocusStore();
		const ghost: WindowOb = {
			id: "ghost-id",
			states: {} as WindowStates,
			targetFile: { value: "/ghost" },
			file: null,
		};
		// Никто не сфокусирован → wasFocused=false. removed=false (id отсутствует).
		useRemoveWindow(ghost);

		expect(f.focusedId).toBeNull();
		expect(pushMock).not.toHaveBeenCalled();
	});

	it("focused ghost-id (focus указывает на несуществующее окно) → focus НЕ сбрасывается т.к. removed=false", () => {
		const f = useFocusStore();
		const ghost: WindowOb = {
			id: "ghost-id",
			states: {} as WindowStates,
			targetFile: { value: "/ghost" },
			file: null,
		};
		f.focus("ghost-id");

		useRemoveWindow(ghost);

		// Гард `removed && wasFocused`: removed=false → focus/router пропуск.
		expect(f.focusedId).toBe("ghost-id");
		expect(pushMock).not.toHaveBeenCalled();
	});

	it("cascade: bounds + frame очищены для удалённого окна", () => {
		const w = useWindowsStore();
		const b = useBoundsStore();
		const fr = useFrameStore();
		const win = w.create(file);
		b.setTarget(win.id, { left: 42 });
		fr.set(win.id, "data:img");

		useRemoveWindow(win);

		expect(b.bounds[win.id]).toBeUndefined();
		expect(fr.images[win.id]).toBeUndefined();
	});
});
