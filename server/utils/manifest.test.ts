import { describe, expect, it } from "bun:test";
import type { ManifestNode } from "~~/shared/types/filesystem";
import { findNode } from "./manifest";

const tree: ManifestNode[] = [
	{
		name: "About",
		path: "/about-me",
		children: [],
		entity: { name: "About", programType: "about" },
	},
	{
		name: "Projects",
		path: "/projects",
		children: [
			{
				name: "P1",
				path: "/projects/p1",
				children: [],
				entity: { name: "P1", programType: "project" },
			},
		],
	},
];

describe("findNode", () => {
	it("root path returns virtual node", () => {
		const n = findNode(tree, "/");
		expect(n?.path).toBe("/");
		expect(n?.children).toBe(tree);
	});
	it("direct child", () => {
		expect(findNode(tree, "/about-me")?.name).toBe("About");
	});
	it("nested path", () => {
		expect(findNode(tree, "/projects/p1")?.name).toBe("P1");
	});
	it("nonexistent returns null", () => {
		expect(findNode(tree, "/nope")).toBeNull();
	});
});
