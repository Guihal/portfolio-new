import { fileURLToPath } from "node:url";
import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [vue()],
	test: {
		environment: "jsdom",
		include: ["tests/unit/**/*.test.ts"],
		globals: false,
		setupFiles: ["./tests/unit/setup.ts"],
	},
	resolve: {
		alias: {
			// Nuxt даёт "@" и "~" на srcDir; программы импортят иконки через "@".
			"@": fileURLToPath(new URL("./app", import.meta.url)),
			"~": fileURLToPath(new URL("./app", import.meta.url)),
			"~~": fileURLToPath(new URL(".", import.meta.url)),
		},
	},
});
