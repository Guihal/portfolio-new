import { describe, expect, it } from "vitest";
import { formatSize } from "~/utils/formatSize";

describe("formatSize", () => {
	it("0 → '0 B'", () => {
		expect(formatSize(0)).toBe("0 B");
	});

	it("bytes (< 1024) — без суффикса", () => {
		expect(formatSize(1)).toBe("1 B");
		expect(formatSize(1023)).toBe("1023 B");
	});

	it("KB (1024 .. 1MB-1) — одна дробная", () => {
		expect(formatSize(1024)).toBe("1.0 KB");
		expect(formatSize(2048)).toBe("2.0 KB");
	});

	it("MB (>= 1MB) — одна дробная", () => {
		expect(formatSize(1024 * 1024)).toBe("1.0 MB");
		expect(formatSize(5 * 1024 * 1024)).toBe("5.0 MB");
	});
});
