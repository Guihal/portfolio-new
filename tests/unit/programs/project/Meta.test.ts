import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import Meta from "~/components/Programs/Project/Meta.vue";

describe("Meta", () => {
	const mountMeta = (props: {
		title: string;
		year?: string;
		tags?: string[];
		description?: string;
		links?: { label: string; href: string }[];
		fallbackPath?: string;
	}) => mount(Meta, { props });

	it("рендерит title", () => {
		const wrapper = mountMeta({ title: "Test Project" });
		expect(wrapper.find(".project__title").text()).toBe("Test Project");
	});

	it("рендерит year когда передан", () => {
		const wrapper = mountMeta({ title: "X", year: "2024" });
		expect(wrapper.find(".project__year").text()).toBe("2024");
		expect(wrapper.find(".project__year--dim").exists()).toBe(false);
	});

	it("показывает fallbackPath dim когда year нет", () => {
		const wrapper = mountMeta({ title: "X", fallbackPath: "/projects/x" });
		expect(wrapper.find(".project__year--dim").text()).toBe("/projects/x");
	});

	it("рендерит tags", () => {
		const wrapper = mountMeta({ title: "X", tags: ["vue", "nuxt"] });
		const items = wrapper.findAll(".project__tag");
		expect(items.length).toBe(2);
		expect(items[0].text()).toBe("vue");
		expect(items[1].text()).toBe("nuxt");
	});

	it("не рендерит tags когда пустой массив", () => {
		const wrapper = mountMeta({ title: "X", tags: [] });
		expect(wrapper.find(".project__tags").exists()).toBe(false);
	});

	it("рендерит description", () => {
		const wrapper = mountMeta({ title: "X", description: "Long text here" });
		expect(wrapper.find(".project__description").text()).toBe("Long text here");
	});

	it("description рендерится когда передан", () => {
		const wrapper = mountMeta({ title: "X", description: "D" });
		expect(wrapper.find(".project__description").exists()).toBe(true);
	});

	it("рендерит links с правильными target", () => {
		const wrapper = mountMeta({
			title: "X",
			links: [
				{ label: "GitHub", href: "https://github.com/x" },
				{ label: "Local", href: "/local" },
			],
		});
		const items = wrapper.findAll(".project__link");
		expect(items.length).toBe(2);
		expect(items[0].attributes("target")).toBe("_blank");
		expect(items[1].attributes("target")).toBe("_self");
	});
});
