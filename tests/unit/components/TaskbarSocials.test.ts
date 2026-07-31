import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import Socials from "~/components/Taskbar/Socials.vue";
import { SOCIAL_LINKS } from "~/utils/constants/socials";

describe("Taskbar/Socials", () => {
	it("рендерит ссылку на каждую соцсеть", () => {
		const wrapper = mount(Socials);
		const links = wrapper.findAll("a");

		expect(links).toHaveLength(SOCIAL_LINKS.length);

		SOCIAL_LINKS.forEach((social, i) => {
			const link = links[i];
			expect(link).toBeDefined();
			expect(link?.attributes("href")).toBe(social.url);
			expect(link?.attributes("target")).toBe("_blank");
			expect(link?.attributes("rel")).toContain("noopener");
			expect(link?.attributes("aria-label")).toBe(social.label);
		});
	});

	// Контракт иконок: цвет задаёт CSS-контекст, размер — тоже.
	it("иконки не хардкодят цвет и размер", () => {
		for (const social of SOCIAL_LINKS) {
			expect(social.icon).toContain('fill="currentColor"');
			expect(social.icon).toContain("viewBox=");
			expect(social.icon).not.toMatch(/<svg[^>]*\s(width|height)=/);
		}
	});
});
