import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		environment: "jsdom",
		include: ["tests/unit/**/*.test.ts"],
		globals: false,
		setupFiles: ["./tests/unit/setup.ts"],
	},
	resolve: {
		alias: {
			"~": fileURLToPath(new URL("./app", import.meta.url)),
			"~~": fileURLToPath(new URL(".", import.meta.url)),
		},
	},
});
