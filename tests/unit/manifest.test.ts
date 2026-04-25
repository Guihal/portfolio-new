// P0-06: findNode по дереву манифеста — корень, вложенное, неизвестное.
import { describe, expect, it } from "vitest";
import { findNode } from "~~/server/utils/manifest";
import type { ManifestNode } from "~~/shared/types/filesystem";

const tree: ManifestNode[] = [
	{ name: "About", path: "/about-me", children: [] },
	{
		name: "Docs",
		path: "/docs",
		children: [{ name: "Readme", path: "/docs/readme", children: [] }],
	},
];

describe("findNode", () => {
	it("/ → виртуальный корень «Рабочий стол»", () => {
		const r = findNode(tree, "/");
		expect(r?.name).toBe("Рабочий стол");
		expect(r?.children).toBe(tree);
	});

	it("/about-me → нода верхнего уровня", () => {
		expect(findNode(tree, "/about-me")?.name).toBe("About");
	});

	it("/docs/readme → вложенная", () => {
		expect(findNode(tree, "/docs/readme")?.name).toBe("Readme");
	});

	it("/unknown → null", () => {
		expect(findNode(tree, "/unknown")).toBeNull();
	});
});
