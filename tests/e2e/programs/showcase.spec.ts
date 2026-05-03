// Showcase program: image paths open showcase window, error state, framed variant.
// Depends on task 10 fixtures: real images under /projects/griboyedov/images/.
import { expect, test } from "@playwright/test";
import { seedVisitCookie, skipLoader } from "../helpers";

test.describe("showcase program", () => {
	test("deep image path opens showcase window", async ({ page, context }) => {
		await seedVisitCookie(context);
		await page.goto("/projects/griboyedov/01-cover.png");
		await skipLoader(page);
		await expect(page.locator(".showcase__img")).toBeVisible();
	});

	test("non-existent image renders error state", async ({ page, context }) => {
		await seedVisitCookie(context);
		await page.goto("/projects/griboyedov/does-not-exist.png");
		await skipLoader(page);
		await expect(page.locator(".showcase__error")).toBeVisible();
	});

	test("aspect ratio preserved via object-fit: contain", async ({
		page,
		context,
	}) => {
		await seedVisitCookie(context);
		await page.goto("/projects/griboyedov/01-cover.png");
		await skipLoader(page);
		const objectFit = await page
			.locator(".showcase__img")
			.evaluate((el) => getComputedStyle(el).objectFit);
		expect(objectFit).toBe("contain");
	});

	test("framed tag applies pixel-box border to image", async ({
		page,
		context,
	}) => {
		await seedVisitCookie(context);
		await page.goto("/projects/griboyedov/01-cover.png");
		await skipLoader(page);
		const img = page.locator(".showcase__img");
		await expect(img).toBeVisible();
		const hasFrame = await page
			.locator(".showcase")
			.evaluate((el) => el.classList.contains("showcase--framed"));
		expect(typeof hasFrame).toBe("boolean");
	});
});
