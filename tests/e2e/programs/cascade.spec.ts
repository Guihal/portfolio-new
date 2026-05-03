// Cascade layout: spawns N code windows from codeWindows.json, diagonal offset, focus.
// Depends on task 10 fixtures: /projects/griboyedov/codeWindows.json + cascade trigger wiring.
import { expect, test } from "@playwright/test";
import { seedVisitCookie, skipLoader } from "../helpers";

const CASCADE_OFFSET_X = 24;
const CASCADE_OFFSET_Y = 14;

test.describe("cascade layout", () => {
	test("opens N code windows from codeWindows manifest", async ({
		page,
		context,
	}) => {
		await seedVisitCookie(context);
		await page.goto("/projects/griboyedov/code-cascade");
		await skipLoader(page);
		await expect(page.locator(".window")).toHaveCount(2);
	});

	test("cascade offset matches 24x14 diagonal", async ({ page, context }) => {
		await seedVisitCookie(context);
		await page.goto("/projects/griboyedov/code-cascade");
		await skipLoader(page);
		const windows = page.locator(".window");
		await expect(windows).toHaveCount(2);
		const first = await windows.first().boundingBox();
		const second = await windows.nth(1).boundingBox();
		if (!first || !second) throw new Error("missing boundingBox");
		expect(Math.round(second.x - first.x)).toBe(CASCADE_OFFSET_X);
		expect(Math.round(second.y - first.y)).toBe(CASCADE_OFFSET_Y);
	});

	test("last cascade window receives focus", async ({ page, context }) => {
		await seedVisitCookie(context);
		await page.goto("/projects/griboyedov/code-cascade");
		await skipLoader(page);
		const windows = page.locator(".window");
		await expect(windows).toHaveCount(2);
		await expect(windows.last()).toHaveClass(/focused/);
	});

	test("empty codeWindows produces zero extra windows", async ({
		page,
		context,
	}) => {
		await seedVisitCookie(context);
		await page.goto("/projects/_e2e-empty/code-cascade");
		await skipLoader(page);
		await expect(page.locator(".window")).toHaveCount(1);
	});
});
