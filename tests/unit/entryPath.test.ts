// Пути из манифеста приходят с ведущим слэшем — resolve(root, "/projects/u24")
// давал абсолютный "/projects/u24" вне entry/, из-за чего asset отдавал 403,
// а resolveContent не находил images/. Регрессия на оба случая.

import { sep } from "node:path";
import { describe, expect, it } from "vitest";
import { ENTRY_ROOT, resolveEntryPath } from "~~/server/utils/entryPath";

describe("resolveEntryPath", () => {
	it("путь с ведущим слэшем остаётся внутри entry/", () => {
		expect(resolveEntryPath("/projects/u24")).toBe(
			`${ENTRY_ROOT}${sep}projects${sep}u24`,
		);
	});

	it("путь без слэша резолвится так же", () => {
		expect(resolveEntryPath("projects/u24")).toBe(
			`${ENTRY_ROOT}${sep}projects${sep}u24`,
		);
	});

	it("сам корень допустим", () => {
		expect(resolveEntryPath("/")).toBe(ENTRY_ROOT);
	});

	it("выход за entry/ → null", () => {
		expect(resolveEntryPath("/../../package.json")).toBeNull();
		expect(resolveEntryPath("../secrets")).toBeNull();
	});
});
