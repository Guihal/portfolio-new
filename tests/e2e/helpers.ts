// P0-06: общие хелперы для смоук-тестов.
import type { BrowserContext, Page } from "@playwright/test";

// Пропускает 2-секундный onboarding-лоадер (Loader.vue).
export async function skipLoader(page: Page) {
	const loader = page.locator(".loader").first();
	try {
		await loader.waitFor({ state: "visible", timeout: 3000 });
	} catch {
		return;
	}
	await page.waitForTimeout(2100);
	await loader.click({ force: true });
	await loader.waitFor({ state: "hidden", timeout: 5000 });
}

// Проставляет about_visited cookie, чтобы app.vue не делал редирект /about.
export async function seedVisitCookie(context: BrowserContext) {
	await context.addCookies([
		{
			name: "about_visited",
			value: "1",
			url: "http://localhost:3000",
		},
	]);
}
