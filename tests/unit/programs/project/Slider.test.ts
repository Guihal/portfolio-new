import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import Slider from "~/components/Programs/Project/Slider.vue";

// Mock useSliderDrag — тестируем Slider.vue изолированно от DOM drag.
vi.mock("~/components/Programs/Project/composables/useSliderDrag", () => ({
	useSliderDrag: () => ({ dragging: ref(false) }),
}));

describe("Slider", () => {
	const mountSlider = (props: {
		images: string[];
		current: number;
		total: number;
		prevDisabled: boolean;
		nextDisabled: boolean;
	}) =>
		mount(Slider, {
			props,
			global: { stubs: { NuxtImg: true } },
		});

	it("рендерит картинку по current index", () => {
		const wrapper = mountSlider({
			images: ["/a.jpg", "/b.jpg"],
			current: 0,
			total: 2,
			prevDisabled: true,
			nextDisabled: false,
		});
		expect(wrapper.find(".project__slide").exists()).toBe(true);
		expect(wrapper.find(".project__empty").exists()).toBe(false);
	});

	it("показывает empty state когда images пуст", () => {
		const wrapper = mountSlider({
			images: [],
			current: 0,
			total: 0,
			prevDisabled: true,
			nextDisabled: true,
		});
		expect(wrapper.find(".project__empty").exists()).toBe(true);
		expect(wrapper.find(".project__empty-text").text()).toBe(
			"Картинок пока нет",
		);
	});

	it("эмитит prev по клику левой стрелки", async () => {
		const wrapper = mountSlider({
			images: ["/a.jpg", "/b.jpg"],
			current: 1,
			total: 2,
			prevDisabled: false,
			nextDisabled: false,
		});
		await wrapper.findAll(".project__nav-btn")[0].trigger("click");
		expect(wrapper.emitted("prev")).toHaveLength(1);
	});

	it("эмитит next по клику правой стрелки", async () => {
		const wrapper = mountSlider({
			images: ["/a.jpg", "/b.jpg"],
			current: 0,
			total: 2,
			prevDisabled: true,
			nextDisabled: false,
		});
		await wrapper.findAll(".project__nav-btn")[1].trigger("click");
		expect(wrapper.emitted("next")).toHaveLength(1);
	});

	it("prev disabled — кнопка неактивна", () => {
		const wrapper = mountSlider({
			images: ["/a.jpg"],
			current: 0,
			total: 1,
			prevDisabled: true,
			nextDisabled: true,
		});
		const btns = wrapper.findAll(".project__nav-btn");
		expect((btns[0].element as HTMLButtonElement).disabled).toBe(true);
	});

	it("next disabled — кнопка неактивна", () => {
		const wrapper = mountSlider({
			images: ["/a.jpg"],
			current: 0,
			total: 1,
			prevDisabled: true,
			nextDisabled: true,
		});
		const btns = wrapper.findAll(".project__nav-btn");
		expect((btns[1].element as HTMLButtonElement).disabled).toBe(true);
	});

	it("показывает counter current/total", () => {
		const wrapper = mountSlider({
			images: ["/a.jpg", "/b.jpg", "/c.jpg"],
			current: 1,
			total: 3,
			prevDisabled: false,
			nextDisabled: false,
		});
		expect(wrapper.find(".project__nav-counter").text()).toBe("2 / 3");
	});
});
