// P0-06: resize внутрь не уводит ширину ниже MINSIZE=320.
import { expect, test } from "@playwright/test";
import { seedVisitCookie, skipLoader } from "../helpers";

test("resize right handle clamped to MINSIZE", async ({ page, context }) => {
	await seedVisitCookie(context);
	await page.goto("/about");
	await skipLoader(page);
	const win = page.locator(".window").first();
	await expect(win).toBeVisible({ timeout: 10_000 });

	const wbBefore = await win.boundingBox();
	if (!wbBefore) throw new Error("no window box");

	const handle = win.locator(".window__resize__controlls").first();
	const hb = await handle.boundingBox();
	if (!hb) throw new Error("no handle box");

	await page.mouse.move(hb.x + hb.width / 2, hb.y + hb.height / 2);
	await page.mouse.down();
	await page.mouse.move(wbBefore.x + 10, hb.y + hb.height / 2, { steps: 20 });
	await page.mouse.up();

	const wbAfter = await win.boundingBox();
	expect(wbAfter!.width).toBeGreaterThanOrEqual(320);
});
