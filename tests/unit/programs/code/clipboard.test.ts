import { describe, expect, it, vi } from "vitest";
import { copyToClipboard, isClipboardAvailable } from "~/services/clipboard";

describe("clipboard", () => {
	describe("copyToClipboard", () => {
		it("returns false when navigator.clipboard and execCommand both unavailable", async () => {
			const originalClipboard = Object.getOwnPropertyDescriptor(
				window.navigator,
				"clipboard",
			);
			Object.defineProperty(window.navigator, "clipboard", {
				value: undefined,
				writable: true,
				configurable: true,
			});
			const originalExecCommand = document.execCommand;
			// biome-ignore lint/suspicious/noExplicitAny: test-only mock
			(document as any).execCommand = undefined;

			const result = await copyToClipboard("hello");
			expect(result).toBe(false);

			if (originalClipboard) {
				Object.defineProperty(window.navigator, "clipboard", originalClipboard);
			}
			// biome-ignore lint/suspicious/noExplicitAny: test-only restore
			(document as any).execCommand = originalExecCommand;
		});

		it("uses navigator.clipboard.writeText when available", async () => {
			const writeText = vi.fn().mockResolvedValue(undefined);
			Object.defineProperty(window.navigator, "clipboard", {
				value: { writeText },
				writable: true,
				configurable: true,
			});

			const result = await copyToClipboard("hello");
			expect(result).toBe(true);
			expect(writeText).toHaveBeenCalledWith("hello");
		});

		it("falls back to execCommand when clipboard.writeText rejects", async () => {
			const writeText = vi.fn().mockRejectedValue(new Error("denied"));
			Object.defineProperty(window.navigator, "clipboard", {
				value: { writeText },
				writable: true,
				configurable: true,
			});
			const originalExecCommand = document.execCommand;
			// biome-ignore lint/suspicious/noExplicitAny: test-only mock
			(document as any).execCommand = vi.fn().mockReturnValue(true);

			const result = await copyToClipboard("hello");
			expect(result).toBe(true);
			// biome-ignore lint/suspicious/noExplicitAny: test-only assertion
			expect((document as any).execCommand).toHaveBeenCalledWith("copy");

			// biome-ignore lint/suspicious/noExplicitAny: test-only restore
			(document as any).execCommand = originalExecCommand;
		});

		it("returns false when execCommand returns false", async () => {
			Object.defineProperty(window.navigator, "clipboard", {
				value: undefined,
				writable: true,
				configurable: true,
			});
			const originalExecCommand = document.execCommand;
			// biome-ignore lint/suspicious/noExplicitAny: test-only mock
			(document as any).execCommand = vi.fn().mockReturnValue(false);

			const result = await copyToClipboard("hello");
			expect(result).toBe(false);

			// biome-ignore lint/suspicious/noExplicitAny: test-only restore
			(document as any).execCommand = originalExecCommand;
		});
	});

	describe("isClipboardAvailable", () => {
		it("returns true when execCommand exists", () => {
			expect(isClipboardAvailable()).toBe(
				typeof document.execCommand === "function",
			);
		});
	});
});
