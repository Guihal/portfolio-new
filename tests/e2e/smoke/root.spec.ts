// P0-06: корень грузится с taskbar + workbench.
import { expect, test } from "@playwright/test";
import { skipLoader } from "../helpers";

test("root renders taskbar and workbench", async ({ page }) => {
	await page.goto("/");
	await skipLoader(page);
	await expect(page.locator(".taskbar")).toBeVisible();
	await expect(page.locator(".workbench")).toBeVisible();
});
