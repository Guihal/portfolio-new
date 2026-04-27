// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("html-to-image", () => ({
	toJpeg: vi.fn(),
}));

import * as htmlToImage from "html-to-image";
import { generatePreview } from "~/services/windowPreviewGenerator";

beforeEach(() => {
	vi.mocked(htmlToImage.toJpeg).mockReset();
});

describe("generatePreview", () => {
	it("happy path → возвращает dataURL из html-to-image с переданными размерами", async () => {
		vi.mocked(htmlToImage.toJpeg).mockResolvedValue(
			"data:image/jpeg;base64,xxx",
		);
		const el = document.createElement("div");
		const r = await generatePreview(el, { width: 200, height: 100 });
		expect(r).toBe("data:image/jpeg;base64,xxx");
		expect(htmlToImage.toJpeg).toHaveBeenCalledWith(
			el,
			expect.objectContaining({
				width: 200,
				height: 100,
				quality: 1,
				cacheBust: true,
			}),
		);
	});

	it("ошибка html-to-image → null (не пробрасывает)", async () => {
		vi.mocked(htmlToImage.toJpeg).mockRejectedValue(new Error("boom"));
		const el = document.createElement("div");
		const r = await generatePreview(el, { width: 100, height: 100 });
		expect(r).toBeNull();
	});

	it("dimensions 0 — passes-through (caller отвечает за валидацию слота)", async () => {
		vi.mocked(htmlToImage.toJpeg).mockResolvedValue(
			"data:image/jpeg;base64,zzz",
		);
		const el = document.createElement("div");
		const r = await generatePreview(el, { width: 0, height: 0 });
		expect(r).toBe("data:image/jpeg;base64,zzz");
		expect(htmlToImage.toJpeg).toHaveBeenCalledWith(
			el,
			expect.objectContaining({ width: 0, height: 0 }),
		);
	});
});
