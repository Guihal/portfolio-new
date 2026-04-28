// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("html-to-image", () => ({
	toBlob: vi.fn(),
}));

import * as htmlToImage from "html-to-image";
import { generatePreview } from "~/services/windowPreviewGenerator";

const FAKE_BLOB = new Blob(["x"], { type: "image/jpeg" });
const FAKE_URL = "blob:http://localhost/fake-uuid";

beforeEach(() => {
	vi.mocked(htmlToImage.toBlob).mockReset();
	// jsdom по дефолту не имеет `URL.createObjectURL` — мокаем стабильное значение.
	URL.createObjectURL = vi.fn(() => FAKE_URL);
	URL.revokeObjectURL = vi.fn();
});

describe("generatePreview", () => {
	it("happy path → возвращает blob:URL из html-to-image с переданными размерами", async () => {
		vi.mocked(htmlToImage.toBlob).mockResolvedValue(FAKE_BLOB);
		const el = document.createElement("div");
		const r = await generatePreview(el, { width: 200, height: 100 });
		expect(r).toBe(FAKE_URL);
		expect(htmlToImage.toBlob).toHaveBeenCalledWith(
			el,
			expect.objectContaining({
				width: 200,
				height: 100,
				quality: 1,
				cacheBust: true,
				type: "image/jpeg",
			}),
		);
		expect(URL.createObjectURL).toHaveBeenCalledWith(FAKE_BLOB);
	});

	it("ошибка html-to-image → null (не пробрасывает)", async () => {
		vi.mocked(htmlToImage.toBlob).mockRejectedValue(new Error("boom"));
		const el = document.createElement("div");
		const r = await generatePreview(el, { width: 100, height: 100 });
		expect(r).toBeNull();
	});

	it("toBlob → null (transient error) → generatePreview возвращает null", async () => {
		vi.mocked(htmlToImage.toBlob).mockResolvedValue(null);
		const el = document.createElement("div");
		const r = await generatePreview(el, { width: 100, height: 100 });
		expect(r).toBeNull();
		expect(URL.createObjectURL).not.toHaveBeenCalled();
	});

	it("dimensions 0 — passes-through (caller отвечает за валидацию слота)", async () => {
		vi.mocked(htmlToImage.toBlob).mockResolvedValue(FAKE_BLOB);
		const el = document.createElement("div");
		const r = await generatePreview(el, { width: 0, height: 0 });
		expect(r).toBe(FAKE_URL);
		expect(htmlToImage.toBlob).toHaveBeenCalledWith(
			el,
			expect.objectContaining({ width: 0, height: 0 }),
		);
	});
});
