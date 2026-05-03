// Regression: existing routes (about, projects) после migration task 04 не сломаны.
import { expect, test } from "@playwright/test";
import { seedVisitCookie, skipLoader } from "./helpers";

test.describe("existing projects regression", () => {
	test("/projects/u24 renders explorer window", async ({ page, context }) => {
		await seedVisitCookie(context);
		await page.goto("/projects/u24");
		await skipLoader(page);
		await expect(page.locator(".window")).toHaveCount(1);
		await expect(page.locator(".explorer").first()).toBeVisible();
		await expect(page).toHaveURL(/\/projects\/u24$/);
	});

	test("/projects/griboyedov renders explorer window", async ({
		page,
		context,
	}) => {
		await seedVisitCookie(context);
		await page.goto("/projects/griboyedov");
		await skipLoader(page);
		await expect(page.locator(".window")).toHaveCount(1);
		await expect(page.locator(".explorer").first()).toBeVisible();
	});

	test("/about renders about window", async ({ page, context }) => {
		await seedVisitCookie(context);
		await page.goto("/about");
		await skipLoader(page);
		await expect(page.locator(".window")).toHaveCount(1);
		await expect(page.locator(".about").first()).toBeVisible();
	});

	test("migrated entity exposes new fields via /api/filesystem/content", async ({
		request,
	}) => {
		const r = await request.get("/api/filesystem/content?path=projects/u24");
		expect(r.status()).toBe(200);
		const body = await r.json();
		expect(body.entity.year).toBeDefined();
		expect(Array.isArray(body.entity.tags)).toBe(true);
		expect(body.entity.tags.length).toBeGreaterThan(0);
	});

	test("griboyedov entity exposes year + tags + links", async ({ request }) => {
		const r = await request.get(
			"/api/filesystem/content?path=projects/griboyedov",
		);
		expect(r.status()).toBe(200);
		const body = await r.json();
		expect(body.entity.year).toBe("2024");
		expect(body.entity.tags).toContain("design");
		expect(Array.isArray(body.entity.links)).toBe(true);
	});
});
