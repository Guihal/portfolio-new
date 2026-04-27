import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick, reactive } from "vue";

// Стабим программный registry: реальные модули тянут SVG `?raw` и
// nuxt-image компоненты, недоступные в vitest без полного Nuxt env.
vi.mock("~/programs", () => ({
	getProgram: () => null,
}));

import Content from "~/components/Window/Content.vue";
import { type WindowOb, WindowObKey } from "~/components/Window/types";
import { useWindowsStore } from "~/stores/windows";
import { useWindowsUIStore } from "~/stores/windowsUI";

const makeOb = (overrides: Partial<WindowOb> = {}): WindowOb =>
	reactive({
		id: "1",
		states: {},
		targetFile: { value: "/a" },
		file: null,
		...overrides,
	}) as WindowOb;

beforeEach(() => {
	setActivePinia(createPinia());
});

const mountContent = (windowOb: WindowOb) =>
	mount(Content, {
		global: {
			provide: { [WindowObKey as symbol]: windowOb },
		},
	});

describe("Content.vue render branches", () => {
	it("error=true + windowsUI.setError('404') → виден .window__content__error с '404'", () => {
		const ui = useWindowsUIStore();
		const ob = makeOb({ states: { error: true } });
		ui.errors[ob.id] = "404";
		const wrapper = mountContent(ob);
		const errEl = wrapper.find(".window__content__error");
		expect(errEl.exists()).toBe(true);
		expect(errEl.text()).toBe("404");
	});

	it("error=true + UI errors empty → fallback 'Не удалось открыть'", () => {
		const ob = makeOb({ states: { error: true } });
		const wrapper = mountContent(ob);
		const errEl = wrapper.find(".window__content__error");
		expect(errEl.exists()).toBe(true);
		expect(errEl.text()).toBe("Не удалось открыть");
	});

	it("loading=true И error=true → loading wins, error block НЕ виден", () => {
		const ui = useWindowsUIStore();
		const ob = makeOb({ states: { loading: true, error: true } });
		ui.errors[ob.id] = "x";
		const wrapper = mountContent(ob);
		expect(wrapper.find(".window__content__error").exists()).toBe(false);
	});

	it("file=null + error/loading undefined → ничего не рендерится", () => {
		const ob = makeOb();
		const wrapper = mountContent(ob);
		expect(wrapper.find(".window__content__error").exists()).toBe(false);
		expect(
			wrapper.find(".window__content__wrapper").element.children.length,
		).toBe(0);
	});

	it("реактивно: error=true → false через store → block убран и UI message cleared", async () => {
		const s = useWindowsStore();
		const ui = useWindowsUIStore();
		const w = s.create("/a");
		ui.setError(w.id, "msg");
		const wrapper = mountContent(w);
		expect(wrapper.find(".window__content__error").exists()).toBe(true);
		ui.setError(w.id, null);
		await nextTick();
		expect(wrapper.find(".window__content__error").exists()).toBe(false);
		expect(ui.getError(w.id)).toBeUndefined();
	});
});
