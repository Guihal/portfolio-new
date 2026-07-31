import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";
import { useTaskbarItems } from "~/components/Taskbar/useTaskbarItems";
import { useWindowsStore } from "~/stores/windows";
import type { FsFile } from "~~/shared/types/filesystem";

const aboutFile: FsFile = {
	name: "about",
	path: "/about",
	programType: "about",
};
const projectFile: FsFile = { name: "p", path: "/p", programType: "project" };

beforeEach(() => {
	setActivePinia(createPinia());
});

describe("useTaskbarItems", () => {
	it("без окон отдаёт закреплённые с пустым списком окон", () => {
		const items = useTaskbarItems();

		expect(items.value).toHaveLength(1);
		expect(items.value[0]?.type).toBe("about");
		expect(items.value[0]?.path).toBe("/about");
		expect(items.value[0]?.windows).toHaveLength(0);
	});

	// Регрессия на дубль: pinned + running одной программы = один элемент.
	it("окно закреплённой программы не создаёт второй элемент", () => {
		useWindowsStore().create(aboutFile);
		const items = useTaskbarItems();

		expect(items.value).toHaveLength(1);
		expect(items.value[0]?.windows).toHaveLength(1);
		expect(items.value[0]?.path).toBe("/about");
	});

	it("незакреплённая программа добавляется после закреплённых", () => {
		useWindowsStore().create(projectFile);
		const items = useTaskbarItems();

		expect(items.value).toHaveLength(2);
		expect(items.value[0]?.type).toBe("about");
		expect(items.value[1]?.type).toBe("project");
		expect(items.value[1]?.path).toBeNull();
	});
});
