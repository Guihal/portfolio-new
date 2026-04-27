import { mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h, inject, nextTick, reactive } from "vue";
import type { FsFile } from "~~/shared/types/filesystem";

// Стабим программный registry: реальные программы тянут SVG `?raw`
// и nuxt-image компоненты, недоступные в vitest без полного Nuxt env.
const aboutStub = defineComponent({ render: () => h("div", "about-stub") });
const explorerStub = defineComponent({
	render: () => h("div", "explorer-stub"),
});

const stubProgramView = (id: "about" | "explorer") => ({
	id,
	label: id,
	icon: "",
	component: id === "about" ? aboutStub : explorerStub,
	config: { showBreadcrumbs: true, canNavigate: id === "explorer" },
});

vi.mock("~/programs", () => ({
	getProgram: vi.fn((type: string) => {
		if (type === "about") return stubProgramView("about");
		if (type === "explorer") return stubProgramView("explorer");
		return null;
	}),
}));

import { useProgramSetup } from "~/components/Window/composables/program/useProgramSetup";
import { ProgramViewKey, type WindowOb } from "~/components/Window/types";

const makeFile = (programType: FsFile["programType"]): FsFile => ({
	name: "x",
	path: `/x-${programType}`,
	programType,
});

const makeOb = (overrides: Partial<WindowOb> = {}): WindowOb =>
	reactive({
		id: "1",
		states: {},
		targetFile: { value: "/x" },
		file: null,
		...overrides,
	}) as WindowOb;

// Harness: parent вызывает useProgramSetup, child injects ProgramViewKey
// и пишет резолвленный programView.id в DOM — ассертим через wrapper.text().
const Child = defineComponent({
	setup() {
		const view = inject(ProgramViewKey, null);
		return () => h("span", { class: "view-id" }, view?.value?.id ?? "null");
	},
});

const Parent = defineComponent({
	props: { ob: { type: Object, required: true } },
	setup(props) {
		const { programView } = useProgramSetup(props.ob as WindowOb);
		return () =>
			h("div", [
				h("b", { class: "parent-id" }, programView.value?.id ?? "null"),
				h(Child),
			]);
	},
});

beforeEach(() => {
	vi.clearAllMocks();
});

describe("useProgramSetup", () => {
	it("file=null → programView=null, child injects null", () => {
		const ob = makeOb();
		const wrapper = mount(Parent, { props: { ob } });
		expect(wrapper.find(".parent-id").text()).toBe("null");
		expect(wrapper.find(".view-id").text()).toBe("null");
	});

	it("file.programType='about' → programView=aboutStub, child видит 'about'", () => {
		const ob = makeOb({ file: makeFile("about") });
		const wrapper = mount(Parent, { props: { ob } });
		expect(wrapper.find(".parent-id").text()).toBe("about");
		expect(wrapper.find(".view-id").text()).toBe("about");
	});

	it("реактивность: смена windowOb.file → programView обновляется и provide пробрасывает", async () => {
		const ob = makeOb({ file: makeFile("about") });
		const wrapper = mount(Parent, { props: { ob } });
		expect(wrapper.find(".view-id").text()).toBe("about");

		ob.file = makeFile("explorer");
		await nextTick();
		expect(wrapper.find(".view-id").text()).toBe("explorer");

		ob.file = null;
		await nextTick();
		expect(wrapper.find(".view-id").text()).toBe("null");
	});

	it("неизвестный programType → getProgram возвращает null → programView=null", async () => {
		const ob = makeOb({
			file: { name: "z", path: "/z", programType: "unknown" as never },
		});
		const wrapper = mount(Parent, { props: { ob } });
		expect(wrapper.find(".view-id").text()).toBe("null");
	});

	it("provide использует именно ProgramViewKey (типизированный Symbol)", () => {
		const ob = makeOb({ file: makeFile("about") });
		// Inject по неправильному ключу не должен ничего достать.
		const StringKeyChild = defineComponent({
			setup() {
				const wrong = inject<unknown>("programView", "no-string-key");
				return () => h("span", { class: "wrong" }, String(wrong));
			},
		});
		const Wrap = defineComponent({
			props: { ob: { type: Object, required: true } },
			setup(props) {
				useProgramSetup(props.ob as WindowOb);
				return () => h(StringKeyChild);
			},
		});
		const wrapper = mount(Wrap, { props: { ob } });
		expect(wrapper.find(".wrong").text()).toBe("no-string-key");
	});
});
