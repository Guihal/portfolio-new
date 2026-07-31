import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it } from "vitest";
import Program from "~/components/Taskbar/Elements/Program/index.vue";
import type { TaskbarItem } from "~/components/Taskbar/useTaskbarItems";
import { useWindowsStore } from "~/stores/windows";
import type { FsFile } from "~~/shared/types/filesystem";

const aboutFile: FsFile = {
	name: "about",
	path: "/about",
	programType: "about",
};

const pinnedItem: TaskbarItem = {
	type: "about",
	path: "/about",
	windows: [],
};

beforeEach(() => {
	setActivePinia(createPinia());
});

describe("Taskbar/Elements/Program", () => {
	it("закреплённая незапущенная — ссылка без индикатора", () => {
		const wrapper = mount(Program, { props: { item: pinnedItem } });

		expect(wrapper.element.tagName).toBe("A");
		expect(wrapper.attributes("href")).toBe("/about");
		expect(wrapper.classes()).not.toContain("taskbar__el--running");
	});

	it("с открытым окном получает индикатор запущенности", () => {
		const windowOb = useWindowsStore().create(aboutFile);
		const wrapper = mount(Program, {
			props: { item: { ...pinnedItem, windows: [windowOb] } },
		});

		expect(wrapper.classes()).toContain("taskbar__el--running");
	});

	// Без preventDefault клик по <a href> = полная перезагрузка страницы.
	it("клик не даёт браузеру уйти по href", async () => {
		const wrapper = mount(Program, { props: { item: pinnedItem } });
		const ev = new MouseEvent("click", { bubbles: true, cancelable: true });

		wrapper.element.dispatchEvent(ev);
		await wrapper.vm.$nextTick();

		expect(ev.defaultPrevented).toBe(true);
	});
});
