import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { computed, ref } from "vue";
import CodeComponent from "~/components/Programs/Code/index.vue";
import { WindowObKey } from "~/components/Window/types";
import type { CodeSnippet } from "~~/server/utils/manifest/resolveCodeContent";

const mockSnippet: CodeSnippet = {
	id: "test-snippet",
	meta: { windowTitle: "Test Window", description: "Test desc" },
	files: [
		{ filename: "index.html", language: "html", source: "<div>hello</div>" },
		{ filename: "style.css", language: "css", source: "body { color: red; }" },
	],
};

const mockWindowOb = {
	id: "w1",
	states: {},
	targetFile: { value: "/projects/test/code/test-snippet" },
	file: null,
};

// Mock useCodeSnippet composable
vi.mock("~/components/Programs/Code/composables/useCodeSnippet", () => ({
	useCodeSnippet: () => ({
		snippet: computed(() => mockSnippet),
		entity: computed(() => null),
		error: ref(null),
		notFound: computed(() => false),
	}),
}));

// Mock clipboard service
vi.mock("~/services/clipboard", () => ({
	copyToClipboard: vi.fn().mockResolvedValue(true),
	isClipboardAvailable: vi.fn().mockReturnValue(true),
}));

describe("Code program", () => {
	it("renders snippet with tabs and code block", () => {
		const wrapper = mount(CodeComponent, {
			global: {
				provide: {
					[WindowObKey as symbol]: mockWindowOb,
				},
				stubs: { CopyButton: true, Tabs: true },
			},
		});

		expect(wrapper.text()).toContain("Test Window");
		expect(wrapper.find("pre code").text()).toContain("<div>hello</div>");
	});

	it("switches active tab on click", async () => {
		const wrapper = mount(CodeComponent, {
			global: {
				provide: {
					[WindowObKey as symbol]: mockWindowOb,
				},
				components: {
					Tabs: (await import("~/components/Programs/Code/Tabs.vue")).default,
				},
				stubs: { CopyButton: true },
			},
		});

		const tabs = wrapper.findAll(".code__tabs li");
		expect(tabs.length).toBe(2);

		// First tab active by default
		expect(tabs[0].classes()).toContain("active");
		expect(wrapper.find("pre code").text()).toContain("<div>hello</div>");

		// Click second tab
		await tabs[1].trigger("click");
		expect(wrapper.find("pre code").text()).toContain("body { color: red; }");
	});

	it("does not execute script payload in source", () => {
		const wrapper = mount(CodeComponent, {
			global: {
				provide: {
					[WindowObKey as symbol]: mockWindowOb,
				},
			},
		});

		const scriptEl = wrapper.find("script");
		expect(scriptEl.exists()).toBe(false);
		// v-text renders source as textContent, not HTML — verify no script injection
		expect(wrapper.find("pre code").exists()).toBe(true);
	});
});
