// Геометрия кадра: бокс img должен совпадать с самой картинкой (letterbox 0),
// иначе pixel-box-маска режет углы бокса, а не изображения.

import { expect, test } from "@playwright/test";
import { skipLoader } from "../helpers";

type Geom = {
	width: number;
	height: number;
	boxRatio: number;
	naturalRatio: number;
	overflow: number;
};

async function measure(
	page: import("@playwright/test").Page,
	selector: string,
) {
	return page.evaluate<Geom | null, string>((sel) => {
		const img = document.querySelector(sel) as HTMLImageElement | null;
		if (!img?.parentElement || !img.naturalHeight) return null;
		const r = img.getBoundingClientRect();
		const p = img.parentElement.getBoundingClientRect();
		return {
			width: r.width,
			height: r.height,
			boxRatio: r.width / r.height,
			naturalRatio: img.naturalWidth / img.naturalHeight,
			overflow: Math.max(
				p.left - r.left,
				p.top - r.top,
				r.right - p.right,
				r.bottom - p.bottom,
			),
		};
	}, selector);
}

const CASES: { name: string; path: string; selector: string }[] = [
	{
		name: "slider",
		path: "/projects/blue-lagoon",
		selector: ".project__slide",
	},
	{
		name: "showcase",
		path: "/projects/blue-lagoon/02.avif",
		selector: ".showcase__img",
	},
];

for (const { name, path, selector } of CASES) {
	test(`${name}: бокс картинки без letterbox`, async ({ page }) => {
		await page.goto(path);
		await skipLoader(page);
		await page.locator(selector).waitFor({ state: "visible" });

		// Ждём фактическую загрузку: до неё naturalHeight === 0.
		await page.waitForFunction(
			(sel) => {
				const img = document.querySelector(sel) as HTMLImageElement | null;
				return !!img && img.naturalHeight > 0;
			},
			selector,
			{ timeout: 15000 },
		);

		const geom = await measure(page, selector);
		expect(geom).not.toBeNull();
		if (!geom) return;
		expect(geom.width).toBeGreaterThan(50);
		expect(geom.height).toBeGreaterThan(50);
		expect(Math.abs(geom.boxRatio - geom.naturalRatio)).toBeLessThan(0.01);
		expect(geom.overflow).toBeLessThan(0.5);
	});
}
