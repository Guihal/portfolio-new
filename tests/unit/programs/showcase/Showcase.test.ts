import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { WindowObKey } from "~/components/Window/types";

const mockState = vi.hoisted(() => {
	const { ref: r } = require("vue");
	return {
		imageUrl: r<string | null>(
			"/api/filesystem/asset?path=projects/test/01.png",
		),
		entity: r<{ name: string; tags?: string[] } | null>({
			name: "Test",
			tags: ["framed"],
		}),
	};
});

vi.mock("~/components/Programs/Showcase/composables/useShowcaseImage", () => ({
	useShowcaseImage: () => ({
		imageUrl: mockState.imageUrl,
		entity: mockState.entity,
	}),
}));

const mockWindowOb = {
	id: "w1",
	states: {},
	targetFile: { value: "/projects/test/01.png" },
	file: null,
};

async function mountShowcase() {
	const Showcase = (await import("~/components/Programs/Showcase/index.vue"))
		.default;
	return mount(Showcase, {
		global: {
			provide: { [WindowObKey as symbol]: mockWindowOb },
			stubs: { NuxtImg: true },
		},
	});
}

describe("Showcase", () => {
	it("renders image when imageUrl exists", async () => {
		mockState.imageUrl.value =
			"/api/filesystem/asset?path=projects/test/01.png";
		mockState.entity.value = { name: "Test" };
		const wrapper = await mountShowcase();
		expect(wrapper.find(".showcase__img").exists()).toBe(true);
		expect(wrapper.find(".showcase__error").exists()).toBe(false);
	});

	it("applies framed class when entity has framed tag", async () => {
		mockState.imageUrl.value =
			"/api/filesystem/asset?path=projects/test/01.png";
		mockState.entity.value = { name: "Test", tags: ["framed"] };
		const wrapper = await mountShowcase();
		expect(wrapper.find(".showcase--framed").exists()).toBe(true);
		expect(wrapper.find(".pixel-box").exists()).toBe(true);
	});

	it("renders error state when imageUrl is null", async () => {
		mockState.imageUrl.value = null;
		mockState.entity.value = null;
		const wrapper = await mountShowcase();
		expect(wrapper.find(".showcase__img").exists()).toBe(false);
		expect(wrapper.find(".showcase__error").exists()).toBe(true);
	});
});
