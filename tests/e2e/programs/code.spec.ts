// Code program: snippet rendering, tab switching, clipboard, XSS guard, disabled state.
// Depends on task 10 fixtures: /projects/griboyedov/codes/marquee/* + /projects/_e2e-xss.
import { expect, test } from "@playwright/test";
import { seedVisitCookie, skipLoader } from "../helpers";

test.describe("code program", () => {
	test("first snippet renders by default", async ({ page, context }) => {
		await seedVisitCookie(context);
		await page.goto("/projects/griboyedov/code");
		await skipLoader(page);
		await expect(page.locator(".code__pre")).toBeVisible();
	});

	test("explicit snippet id loads correct snippet", async ({
		page,
		context,
	}) => {
		await seedVisitCookie(context);
		await page.goto("/projects/griboyedov/code/marquee");
		await skipLoader(page);
		await expect(page.locator(".code__title")).toContainText(/marquee/i);
	});

	test("tabs switch active file", async ({ page, context }) => {
		await seedVisitCookie(context);
		await page.goto("/projects/griboyedov/code/marquee");
		await skipLoader(page);
		const tabs = page.locator(".code__tabs li");
		await expect(tabs.first()).toBeVisible();
		await tabs.nth(1).click();
		await expect(tabs.nth(1)).toHaveClass(/active/);
	});

	test("copy button writes to clipboard with feedback", async ({
		page,
		context,
	}) => {
		await context.grantPermissions(["clipboard-read", "clipboard-write"]);
		await seedVisitCookie(context);
		await page.goto("/projects/griboyedov/code/marquee");
		await skipLoader(page);
		await page.locator(".code__copy").click();
		await expect(page.locator(".code__copy.copied")).toBeVisible();
		const text = await page.evaluate(() => navigator.clipboard.readText());
		expect(text.length).toBeGreaterThan(0);
	});

	test("script payload not executed (XSS guard)", async ({ page, context }) => {
		await seedVisitCookie(context);
		await page.goto("/projects/_e2e-xss/code/payload");
		await skipLoader(page);
		const pwned = await page.evaluate(
			() => (window as unknown as { __pwned?: boolean }).__pwned,
		);
		expect(pwned).toBeUndefined();
		await expect(page.locator(".code__pre code")).toContainText("<script>");
	});

	test("copy button disabled when clipboard unavailable", async ({
		page,
		context,
	}) => {
		await seedVisitCookie(context);
		await page.addInitScript(() => {
			Object.defineProperty(navigator, "clipboard", {
				configurable: true,
				value: undefined,
			});
		});
		await page.goto("/projects/griboyedov/code/marquee");
		await skipLoader(page);
		await expect(page.locator(".code__copy")).toBeDisabled();
	});
});
