// P0-06: drag header за левый край → класс fullscreen на окне.
import { expect, test } from "@playwright/test";
import { seedVisitCookie, skipLoader } from "../helpers";

test("drag header to edge → fullscreen", async ({ page, context }) => {
	await seedVisitCookie(context);
	await page.goto("/about");
	await skipLoader(page);
	const win = page.locator(".window").first();
	await expect(win).toBeVisible({ timeout: 10_000 });
	const header = win.locator(".window__header__wrapper");
	const box = await header.boundingBox();
	if (!box) throw new Error("no header box");

	await page.mouse.move(box.x + 20, box.y + 10);
	await page.mouse.down();
	for (let i = 0; i < 20; i++) {
		await page.mouse.move(
			Math.max(0, box.x - i * 20),
			Math.max(0, box.y - i * 2),
			{ steps: 3 },
		);
	}
	await page.mouse.up();

	await expect(win).toHaveClass(/(^|\s)fullscreen(\s|$)/);
});
