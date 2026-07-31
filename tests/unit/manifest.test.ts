// findNode по дереву — корень, вложенное, неизвестное.
// scanTree — обход реального server/assets/entry: entity-поля, виртуальные
// ноды images/ (showcase) и codes/ (code).

import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { findNode } from "~~/server/utils/manifest/findNode";
import { scanTree } from "~~/server/utils/manifest/scanTree";
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

describe("scanTree", () => {
	const entryRoot = join(process.cwd(), "server", "assets", "entry");
	const fixture = join(entryRoot, "scan-fixture");

	beforeAll(() => {
		rmSync(fixture, { recursive: true, force: true });
		mkdirSync(join(fixture, "images"), { recursive: true });
		mkdirSync(join(fixture, "codes", "demo-snippet"), { recursive: true });

		writeFileSync(
			join(fixture, "entity.json"),
			JSON.stringify({
				name: "Project X",
				programType: "project",
				year: "2024",
				tags: ["web", "vue"],
				description: "A test project",
				links: [{ label: "GitHub", href: "https://github.com/x" }],
			}),
		);
		writeFileSync(join(fixture, "images", "01-cover.png"), "");
		writeFileSync(
			join(fixture, "codes", "demo-snippet", "meta.json"),
			JSON.stringify({ windowTitle: "Demo" }),
		);
		writeFileSync(join(fixture, "codes", "demo-snippet", "index.ts"), "");
	});

	afterAll(() => {
		rmSync(fixture, { recursive: true, force: true });
	});

	it("entity-поля попадают в flatIndex", async () => {
		const { flatIndex } = await scanTree();
		const entry = flatIndex["/scan-fixture"];
		expect(entry?.entity?.year).toBe("2024");
		expect(entry?.entity?.tags).toEqual(["web", "vue"]);
		expect(entry?.entity?.description).toBe("A test project");
		expect(entry?.entity?.links).toEqual([
			{ label: "GitHub", href: "https://github.com/x" },
		]);
	});

	it("mtime — ISO 8601 у директории и файла; size — только у файла", async () => {
		const { flatIndex, tree: scanned } = await scanTree();
		const dirEntry = flatIndex["/scan-fixture"];
		expect(dirEntry?.mtime).toMatch(
			/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
		);
		expect(dirEntry?.size).toBeUndefined();

		const node = findNode(scanned, "/scan-fixture");
		const image = node?.children.find(
			(c) => c.path === "/scan-fixture/01-cover.png",
		);
		expect(image?.mtime).toMatch(
			/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
		);
		expect(image?.size).toBe(0);

		const code = node?.children.find(
			(c) => c.path === "/scan-fixture/code/demo-snippet",
		);
		expect(code?.mtime).toMatch(
			/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
		);
		expect(code?.size).toBeUndefined();
	});

	it("images/ и codes/ поднимаются в children как showcase/code", async () => {
		const { tree: scanned } = await scanTree();
		const node = findNode(scanned, "/scan-fixture");
		const paths = node?.children.map((c) => c.path);

		expect(paths).toContain("/scan-fixture/01-cover.png");
		expect(paths).toContain("/scan-fixture/code/demo-snippet");
		expect(paths).not.toContain("/scan-fixture/images");

		const image = node?.children.find(
			(c) => c.path === "/scan-fixture/01-cover.png",
		);
		expect(image?.entity?.programType).toBe("showcase");

		const code = node?.children.find(
			(c) => c.path === "/scan-fixture/code/demo-snippet",
		);
		expect(code?.entity).toEqual({ name: "Demo", programType: "code" });
	});
});
