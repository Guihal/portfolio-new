// P0-06: close окна через hover на taskbar-frame → счётчик .window уменьшается.
import { expect, test } from "@playwright/test";
import { seedVisitCookie, skipLoader } from "../helpers";

test("close window via taskbar frame close button", async ({
	page,
	context,
}) => {
	await seedVisitCookie(context);
	await page.goto("/");
	await skipLoader(page);
	await page.locator('a.shortcut[href="/about"]').first().click();
	await expect(page.locator(".window")).toHaveCount(1);

	const programItem = page.locator("button.taskbar__el").first();
	await programItem.hover();

	const closeBtn = page.locator(".taskbar__frame-close").first();
	await expect(closeBtn).toBeVisible();
	await closeBtn.click();

	await expect(page.locator(".window")).toHaveCount(0);
});
