// Регрессия: setPointerCapture на root слайдера перенаправлял цель click,
// из-за чего кнопки навигации внутри слайдера не нажимались.
// Capture должен ставиться только для pointerdown основной кнопкой по самому root.

import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { defineComponent, h, ref } from "vue";
import { useSliderDrag } from "~/components/Programs/Project/composables/useSliderDrag";

function mountHost() {
	const next = vi.fn();
	const prev = vi.fn();

	const Host = defineComponent({
		setup() {
			const root = ref<HTMLElement>();
			useSliderDrag(root, next, prev);
			return () =>
				h("div", { ref: root, class: "root" }, [
					h("button", { class: "nav-btn" }, "→"),
				]);
		},
	});

	const wrapper = mount(Host, { attachTo: document.body });
	const root = wrapper.find(".root").element as HTMLElement;
	const btn = wrapper.find(".nav-btn").element as HTMLElement;

	const setPointerCapture = vi.fn();
	root.setPointerCapture = setPointerCapture;

	return { wrapper, root, btn, setPointerCapture, next, prev };
}

function pointerDown(
	el: HTMLElement,
	target: HTMLElement,
	init: { button?: number } = {},
): void {
	const e = new Event("pointerdown", { bubbles: true }) as PointerEvent & {
		button: number;
		clientX: number;
		pointerId: number;
	};
	Object.assign(e, { button: init.button ?? 0, clientX: 0, pointerId: 1 });
	target.dispatchEvent(e);
	void el;
}

describe("useSliderDrag", () => {
	it("pointerdown по root ставит capture", () => {
		const { root, setPointerCapture, wrapper } = mountHost();
		pointerDown(root, root);
		expect(setPointerCapture).toHaveBeenCalledTimes(1);
		wrapper.unmount();
	});

	it("pointerdown по вложенной кнопке capture не ставит", () => {
		const { root, btn, setPointerCapture, wrapper } = mountHost();
		pointerDown(root, btn);
		expect(setPointerCapture).not.toHaveBeenCalled();
		wrapper.unmount();
	});

	it("не основная кнопка мыши capture не ставит", () => {
		const { root, setPointerCapture, wrapper } = mountHost();
		pointerDown(root, root, { button: 2 });
		expect(setPointerCapture).not.toHaveBeenCalled();
		wrapper.unmount();
	});
});
