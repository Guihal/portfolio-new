import { afterEach, describe, expect, it, vi } from "vitest";
import { logger } from "~~/shared/utils/logger";

describe("logger", () => {
	afterEach(() => vi.restoreAllMocks());

	it("warn forwards args to console.warn", () => {
		const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
		logger.warn("m", { a: 1 });
		expect(spy).toHaveBeenCalledWith("m", { a: 1 });
	});

	it("error forwards args to console.error", () => {
		const spy = vi.spyOn(console, "error").mockImplementation(() => {});
		const e = new Error("boom");
		logger.error("ctx", e);
		expect(spy).toHaveBeenCalledWith("ctx", e);
	});

	it("info forwards args to console.info", () => {
		const spy = vi.spyOn(console, "info").mockImplementation(() => {});
		logger.info("i");
		expect(spy).toHaveBeenCalledWith("i");
	});

	it("debug emits in non-prod env", () => {
		const spy = vi.spyOn(console, "debug").mockImplementation(() => {});
		logger.debug("d");
		expect(spy).toHaveBeenCalledWith("d");
	});
});
