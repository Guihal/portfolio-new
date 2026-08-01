// Тест buildSitemapUrls: root всегда, showcase-ноды (картинки) отфильтрованы,
// project/code остаются, приоритеты и lastmod сохраняются.

import { describe, expect, it } from "vitest";
import { buildSitemapUrls } from "~~/server/utils/manifest/sitemap";
import type { Manifest } from "~~/shared/types/filesystem";

const flatIndex: Manifest["flatIndex"] = {
	"/": {
		name: "/",
		path: "/",
		entity: { name: "Рабочий стол", programType: "explorer" },
	},
	"/about": {
		name: "Обо мне",
		path: "/about",
		entity: { name: "Обо мне", programType: "about" },
	},
	"/projects": {
		name: "Проекты",
		path: "/projects",
		entity: { name: "Проекты", programType: "explorer" },
	},
	"/projects/u24": {
		name: "U24",
		path: "/projects/u24",
		entity: { name: "U24", programType: "project" },
		mtime: "2026-01-01T00:00:00.000Z",
	},
	"/projects/u24/01.avif": {
		name: "01.avif",
		path: "/projects/u24/01.avif",
		entity: { name: "01.avif", programType: "showcase" },
	},
	"/projects/u24/code/foo": {
		name: "foo",
		path: "/projects/u24/code/foo",
		entity: { name: "foo", programType: "code" },
	},
};

describe("buildSitemapUrls", () => {
	it("always includes root with priority 1.0", () => {
		const urls = buildSitemapUrls(flatIndex, "https://example.com");
		expect(urls[0]).toEqual({ loc: "https://example.com/", priority: 1.0 });
	});

	it("filters showcase nodes (images are not pages)", () => {
		const urls = buildSitemapUrls(flatIndex, "https://example.com");
		expect(urls.some((u) => u.loc.endsWith(".avif"))).toBe(false);
		expect(urls).toHaveLength(5);
	});

	it("keeps project and code nodes with origin-joined loc", () => {
		const urls = buildSitemapUrls(flatIndex, "https://example.com");
		expect(urls.map((u) => u.loc)).toEqual([
			"https://example.com/",
			"https://example.com/about",
			"https://example.com/projects",
			"https://example.com/projects/u24",
			"https://example.com/projects/u24/code/foo",
		]);
	});

	it("priority: about = 1.0, project = 0.8, code = 0.6", () => {
		const urls = buildSitemapUrls(flatIndex, "https://example.com");
		const byLoc = new Map(urls.map((u) => [u.loc, u.priority]));
		expect(byLoc.get("https://example.com/about")).toBe(1.0);
		expect(byLoc.get("https://example.com/projects/u24")).toBe(0.8);
		expect(byLoc.get("https://example.com/projects/u24/code/foo")).toBe(0.6);
	});

	it("preserves lastmod when present", () => {
		const urls = buildSitemapUrls(flatIndex, "https://example.com");
		const u24 = urls.find((u) => u.loc.endsWith("/projects/u24"));
		expect(u24?.lastmod).toBe("2026-01-01T00:00:00.000Z");
	});

	it("skips entries without entity", () => {
		const urls = buildSitemapUrls(
			{ "/orphan": { name: "orphan", path: "/orphan" } },
			"https://example.com",
		);
		expect(urls).toHaveLength(1);
	});
});
