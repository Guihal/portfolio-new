// P0-06: клик по ярлыку about → одно окно + URL (ловит дубликат из P1-01).
import { expect, test } from "@playwright/test";
import { skipLoader } from "../helpers";

test("shortcut click opens exactly one window", async ({ page }) => {
	await page.goto("/");
	await skipLoader(page);
	const shortcut = page.locator('a.shortcut[href="/about"]').first();
	await expect(shortcut).toBeVisible();
	await shortcut.click();
	await expect(page.locator(".window")).toHaveCount(1);
	await expect(page).toHaveURL(/\/about$/);
});

test("double dblclick on same shortcut does not spawn duplicate window", async ({
	page,
}) => {
	await page.goto("/");
	await skipLoader(page);
	const shortcut = page.locator('a.shortcut[href="/about"]').first();
	await expect(shortcut).toBeVisible();
	await shortcut.dblclick();
	await expect(page.locator(".window")).toHaveCount(1);
	await shortcut.dblclick();
	await expect(page.locator(".window")).toHaveCount(1);
	await expect(page).toHaveURL(/\/about$/);
});
