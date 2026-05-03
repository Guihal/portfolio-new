// P0-06: findNode по дереву манифеста — корень, вложенное, неизвестное.
// P0-03: generateManifest с zod Entity schema и extended fields.

import { mkdirSync, readFileSync, rmSync, writeFileSync } from "fs";
import { join } from "path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { generateManifest } from "~~/scripts/generate-manifest";
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

describe("generateManifest", () => {
	const tmpDir = join(process.cwd(), "tests", "unit", "tmp-manifest");
	const outFile = join(tmpDir, "manifest.json");

	beforeAll(() => {
		rmSync(tmpDir, { recursive: true, force: true });
		mkdirSync(tmpDir, { recursive: true });

		// Root entity
		writeFileSync(
			join(tmpDir, "entity.json"),
			JSON.stringify({ name: "Root", programType: "explorer" }),
		);

		// Subdir with extended fields
		const subDir = join(tmpDir, "project-x");
		mkdirSync(subDir, { recursive: true });
		writeFileSync(
			join(subDir, "entity.json"),
			JSON.stringify({
				name: "Project X",
				programType: "project",
				year: "2024",
				tags: ["web", "vue"],
				description: "A test project",
				links: [{ label: "GitHub", href: "https://github.com/x" }],
			}),
		);
	});

	afterAll(() => {
		rmSync(tmpDir, { recursive: true, force: true });
	});

	it("manifest includes extended Entity fields", () => {
		generateManifest(tmpDir, outFile);
		const manifest = JSON.parse(readFileSync(outFile, "utf-8")) as {
			flatIndex: Record<
				string,
				{
					entity?: {
						year?: string;
						tags?: string[];
						description?: string;
						links?: { label: string; href: string }[];
					};
				}
			>;
		};

		const entry = manifest.flatIndex["/project-x"];
		expect(entry).toBeDefined();
		expect(entry.entity?.year).toBe("2024");
		expect(entry.entity?.tags).toEqual(["web", "vue"]);
		expect(entry.entity?.description).toBe("A test project");
		expect(entry.entity?.links).toEqual([
			{ label: "GitHub", href: "https://github.com/x" },
		]);
	});
});

describe("builder:watch glob covers entry subtree", () => {
	it("nuxt.config.ts builder:watch triggers on server/assets/entry changes", () => {
		const configSource = readFileSync(
			join(process.cwd(), "nuxt.config.ts"),
			"utf-8",
		);
		expect(configSource).toContain('"builder:watch"');
		expect(configSource).toContain("server/assets/entry");
	});
});
