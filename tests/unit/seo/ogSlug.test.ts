import { describe, expect, it } from "vitest";
import { ogSlug } from "~/utils/ogSlug";

describe("ogSlug", () => {
	it("/ → index", () => expect(ogSlug("/")).toBe("index"));
	it("пустая строка → index", () => expect(ogSlug("")).toBe("index"));
	it("single segment → about", () => expect(ogSlug("/about")).toBe("about"));
	it("2 segments → projects-u24", () =>
		expect(ogSlug("/projects/u24")).toBe("projects-u24"));
	it("3 segments → last 3 joined (projects-u24-images)", () =>
		expect(ogSlug("/projects/u24/images")).toBe("projects-u24-images"));
	it("4+ segments → last 3 joined (collision-safe)", () =>
		expect(ogSlug("/projects/u24/codes/foo")).toBe("u24-codes-foo"));
	it("trailing slash игнорируется", () =>
		expect(ogSlug("/about/")).toBe("about"));
	it("dublicate slashes игнорируются", () =>
		expect(ogSlug("//about//")).toBe("about"));
	it("deep path не дублирует (5+ segs → last 3)", () =>
		expect(ogSlug("/a/b/c/d/e")).toBe("c-d-e"));
});
