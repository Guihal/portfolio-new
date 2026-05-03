// Project program: slider + meta panel rendering, navigation, mobile layout, edge cases.
// Depends on task 10 fixtures: /projects/_e2e-project, /projects/_e2e-empty.
import { expect, test } from "@playwright/test";
import { seedVisitCookie, skipLoader } from "../helpers";

test.describe("project program", () => {
	test("renders slider + meta panel", async ({ page, context }) => {
		await seedVisitCookie(context);
		await page.goto("/projects/_e2e-project");
		await skipLoader(page);
		await expect(page.locator(".project__slider")).toBeVisible();
		await expect(page.locator(".project__meta")).toBeVisible();
	});

	test("next button advances slide counter", async ({ page, context }) => {
		await seedVisitCookie(context);
		await page.goto("/projects/_e2e-project");
		await skipLoader(page);
		const counter = page.locator(".project__nav-counter");
		await expect(counter).toContainText("1 /");
		await page.locator(".project__nav-btn").last().click();
		await expect(counter).toContainText("2 /");
	});

	test("mobile viewport activates column-reverse layout", async ({
		page,
		context,
	}) => {
		await seedVisitCookie(context);
		await page.setViewportSize({ width: 420, height: 760 });
		await page.goto("/projects/_e2e-project");
		await skipLoader(page);
		const project = page.locator(".project");
		await expect(project).toBeVisible();
		const flexDirection = await project.evaluate(
			(el) => getComputedStyle(el).flexDirection,
		);
		expect(flexDirection).toBe("column-reverse");
	});

	test("empty state when no images", async ({ page, context }) => {
		await seedVisitCookie(context);
		await page.goto("/projects/_e2e-empty");
		await skipLoader(page);
		await expect(page.locator(".project__empty")).toBeVisible();
	});

	test("error state on fetch failure", async ({ page, context }) => {
		await seedVisitCookie(context);
		await page.route("**/api/filesystem/content**", (r) => r.abort("failed"));
		await page.goto("/projects/_e2e-project");
		await skipLoader(page);
		await expect(page.locator(".project__error")).toBeVisible();
	});
});
