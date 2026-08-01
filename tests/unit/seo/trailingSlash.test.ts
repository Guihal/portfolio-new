// Тест normalizeTrailingSlashPath: page-пути нормализуются (301-цель),
// корень/API/Nuxt-ассеты/файлы/protocol-relative (open redirect) — нет.

import { describe, expect, it } from "vitest";
import { normalizeTrailingSlashPath } from "~~/server/utils/trailingSlash";

describe("normalizeTrailingSlashPath", () => {
	it("normalizes trailing slash on page paths", () => {
		expect(normalizeTrailingSlashPath("/about/")).toBe("/about");
		expect(normalizeTrailingSlashPath("/projects/u24/")).toBe("/projects/u24");
		expect(normalizeTrailingSlashPath("/projects/u24/code/foo/")).toBe(
			"/projects/u24/code/foo",
		);
	});

	it("returns null for root", () => {
		expect(normalizeTrailingSlashPath("/")).toBeNull();
	});

	it("returns null for paths without trailing slash", () => {
		expect(normalizeTrailingSlashPath("/about")).toBeNull();
		expect(normalizeTrailingSlashPath("/projects/u24")).toBeNull();
	});

	it("skips API and Nuxt asset paths", () => {
		expect(normalizeTrailingSlashPath("/api/filesystem/get/")).toBeNull();
		expect(normalizeTrailingSlashPath("/_nuxt/foo/")).toBeNull();
	});

	it("skips file-like paths (extension in last segment)", () => {
		expect(normalizeTrailingSlashPath("/img.png/")).toBeNull();
		expect(normalizeTrailingSlashPath("/og/index.png/")).toBeNull();
	});

	it("guards protocol-relative open redirect", () => {
		expect(normalizeTrailingSlashPath("//evil.com/")).toBeNull();
		expect(normalizeTrailingSlashPath("//")).toBeNull();
	});
});
