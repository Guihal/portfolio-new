import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
	testDir: "tests/e2e",
	fullyParallel: false,
	retries: process.env.CI ? 1 : 0,
	reporter: "list",
	use: {
		baseURL: "http://localhost:3000",
		viewport: { width: 1280, height: 800 },
	},
	webServer: {
		command: "bun run dev",
		url: "http://localhost:3000",
		reuseExistingServer: !process.env.CI,
		timeout: 300_000,
		env: { NUXT_TEST_SPA: "1" },
	},
	projects: [{ name: "chromium", use: devices["Desktop Chrome"] }],
});
