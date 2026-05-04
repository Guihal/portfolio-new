import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";

const callOrder: string[] = [];
const createMock = vi.fn(async (path: string) => {
	callOrder.push(path);
	const w = useWindowsStore().create({
		name: path,
		path,
		programType: "code",
	});
	void w;
	return true;
});

vi.mock(
	"~/components/Window/composables/lifecycle/useCreateWindowByPath",
	() => ({
		useCreateWindowByPath: (path: string) => createMock(path),
	}),
);

import { useCascadeLayout } from "~/composables/useCascadeLayout";
import { useBoundsStore } from "~/stores/bounds";
import { useContentAreaStore } from "~/stores/contentArea";
import { useFocusStore } from "~/stores/focus";
import { useWindowsStore } from "~/stores/windows";

beforeEach(() => {
	setActivePinia(createPinia());
	callOrder.length = 0;
	createMock.mockClear();
	useContentAreaStore().setViewport({ width: 1200, height: 800 });
});

describe("useCascadeLayout — spawnCodeWindows", () => {
	it("спавнит окна в порядке массива (sequential await)", async () => {
		const { spawnCodeWindows } = useCascadeLayout();
		await spawnCodeWindows("/projects/test", {
			layout: "cascade",
			windows: [{ id: "a" }, { id: "b" }, { id: "c" }],
		});
		expect(callOrder).toEqual([
			"/projects/test/code/a",
			"/projects/test/code/b",
			"/projects/test/code/c",
		]);
	});

	it("устанавливает cascade-bounds на каждое окно (left/top смещаются)", async () => {
		const { spawnCodeWindows } = useCascadeLayout();
		await spawnCodeWindows("/projects/p", {
			layout: "cascade",
			windows: [{ id: "x" }, { id: "y" }],
		});
		const wins = useWindowsStore().list;
		expect(wins.length).toBe(2);
		const b = useBoundsStore();
		const first = wins[0];
		const second = wins[1];
		if (!first || !second) throw new Error("windows missing");
		expect(b.bounds[first.id]?.target.left).toBe(0);
		expect(b.bounds[first.id]?.target.top).toBe(0);
		expect(b.bounds[second.id]?.target.left).toBe(24);
		expect(b.bounds[second.id]?.target.top).toBe(14);
	});

	it("focus заканчивается на последнем окне", async () => {
		const { spawnCodeWindows } = useCascadeLayout();
		await spawnCodeWindows("/projects/p", {
			layout: "cascade",
			windows: [{ id: "a" }, { id: "b" }],
		});
		const wins = useWindowsStore().list;
		const last = wins[wins.length - 1];
		if (!last) throw new Error("no last");
		expect(useFocusStore().focusedId).toBe(last.id);
	});

	it("пустой массив — no-op", async () => {
		const { spawnCodeWindows } = useCascadeLayout();
		await spawnCodeWindows("/projects/p", { layout: "cascade", windows: [] });
		expect(createMock).not.toHaveBeenCalled();
		expect(useWindowsStore().list.length).toBe(0);
	});

	it("layout: tile-h — первое окно left=0 half width, второе — right half", async () => {
		const { spawnCodeWindows } = useCascadeLayout();
		await spawnCodeWindows("/projects/p", {
			layout: "tile-h",
			windows: [{ id: "a" }, { id: "b" }],
		});
		const wins = useWindowsStore().list;
		const first = wins[0];
		const second = wins[1];
		if (!first || !second) throw new Error("missing");
		const b = useBoundsStore();
		expect(b.bounds[first.id]?.target.left).toBe(0);
		expect(b.bounds[first.id]?.target.width).toBe(592);
		expect(b.bounds[second.id]?.target.left).toBe(608);
	});
});
