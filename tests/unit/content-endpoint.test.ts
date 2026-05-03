// P0-06: /api/filesystem/content endpoint — resolveContent + validation.
import { describe, expect, it, vi } from "vitest";
import { resolveContent } from "~~/server/utils/manifest/resolveContent";
import { parseContentPathQuery } from "~~/server/utils/validation";

// Stub getEntity from resolveEntity
vi.mock("~~/server/utils/manifest/resolveEntity", () => ({
	getEntity: vi.fn(),
}));

import { getEntity } from "~~/server/utils/manifest/resolveEntity";

const mockGetEntity = vi.mocked(getEntity);

describe("parseContentPathQuery", () => {
	it("accepts valid path", () => {
		const r = parseContentPathQuery({ path: "projects/u24" });
		expect(r.path).toBe("projects/u24");
	});

	it("rejects path traversal", () => {
		expect(() => parseContentPathQuery({ path: "../../etc/passwd" })).toThrow();
	});

	it("rejects path with ..", () => {
		expect(() => parseContentPathQuery({ path: "projects/../u24" })).toThrow();
	});

	it("rejects empty path", () => {
		expect(() => parseContentPathQuery({ path: "" })).toThrow();
	});

	it("rejects non-string path", () => {
		expect(() => parseContentPathQuery({ path: 123 })).toThrow();
	});
});

describe("resolveContent", () => {
	it("returns null for missing entity", async () => {
		mockGetEntity.mockResolvedValue(null);
		const r = await resolveContent("does-not-exist");
		expect(r).toBeNull();
	});

	it("returns entity content without images when no images dir", async () => {
		mockGetEntity.mockResolvedValue({
			name: "u24",
			programType: "explorer",
		});
		const r = await resolveContent("projects/u24");
		expect(r).not.toBeNull();
		expect(r?.entity.name).toBe("u24");
		expect(r?.images).toBeUndefined();
	});

	it("returns undefined codes for non-code programType", async () => {
		mockGetEntity.mockResolvedValue({
			name: "about",
			programType: "about",
		});
		const r = await resolveContent("about");
		expect(r).not.toBeNull();
		expect(r?.codes).toBeUndefined();
	});
});
