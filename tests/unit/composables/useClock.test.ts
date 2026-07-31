import { mount } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, h } from "vue";
import { useClock } from "~/composables/global/useClock";

const Host = defineComponent({
	setup() {
		const clock = useClock();
		return () => h("span", clock.value.time);
	},
});

describe("useClock", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it("обновляет время по тику", async () => {
		vi.setSystemTime(new Date(2026, 6, 28, 9, 59, 30));
		const wrapper = mount(Host);
		expect(wrapper.text()).toContain("09:59");

		vi.setSystemTime(new Date(2026, 6, 28, 10, 0, 30));
		vi.advanceTimersByTime(1000);
		await wrapper.vm.$nextTick();

		expect(wrapper.text()).toContain("10:00");
	});

	it("снимает интервал при unmount", () => {
		const wrapper = mount(Host);
		expect(vi.getTimerCount()).toBe(1);

		wrapper.unmount();
		expect(vi.getTimerCount()).toBe(0);
	});
});
