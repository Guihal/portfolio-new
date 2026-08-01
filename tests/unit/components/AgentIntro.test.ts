// Тест AgentIntro: скрытый блок самопрезентации рендерится (SSR-доступен
// агентам), визуально скрыт классом visually-hidden и содержит ключевые
// фразы сжатой версии about.

import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import AgentIntro from "~/components/AgentIntro.vue";

describe("AgentIntro", () => {
	it("renders with visually-hidden class", () => {
		const wrapper = mount(AgentIntro);
		const el = wrapper.find(".agent-intro");
		expect(el.exists()).toBe(true);
		expect(el.classes()).toContain("visually-hidden");
	});

	it("contains compressed about content", () => {
		const wrapper = mount(AgentIntro);
		const text = wrapper.text();
		expect(text).toContain("Дмитрия Стаценко");
		expect(text).toContain("fullstack-разработчик");
		expect(text).toContain("3.5 года");
		expect(text).toContain("llama.cpp");
	});

	it("exposes navigation hints for agents", () => {
		const wrapper = mount(AgentIntro);
		const text = wrapper.text();
		expect(text).toContain("/about");
		expect(text).toContain("/projects");
	});
});
