// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: "2025-07-15",
	devtools: { enabled: false },
	ssr: !process.env.NUXT_TEST_SPA,
	modules: ["@nuxt/eslint", "@nuxt/image", "@pinia/nuxt"],
	typescript: {
		tsConfig: {
			compilerOptions: {
				strict: true,
				noUncheckedIndexedAccess: true,
			},
		},
	},
	nitro: {
		preset: "node-server",
	},
	routeRules: {
		"/api/filesystem/list": {
			headers: {
				"cache-control": "public, s-maxage=3600, stale-while-revalidate=60",
			},
		},
		"/api/filesystem/get": {
			headers: {
				"cache-control": "public, s-maxage=3600, stale-while-revalidate=60",
			},
		},
		"/api/filesystem/breadcrumbs": {
			headers: {
				"cache-control": "public, s-maxage=3600, stale-while-revalidate=60",
			},
		},
		"/api/filesystem/content": {
			headers: {
				"cache-control": "public, s-maxage=3600, stale-while-revalidate=60",
			},
		},
		"/api/filesystem/asset": {
			headers: {
				"cache-control": "public, s-maxage=86400, stale-while-revalidate=300",
			},
		},
	},
	runtimeConfig: {
		public: {
			enableDebugLogs: process.env.NODE_ENV !== "production",
		},
	},
	//pages: false,
	vite: {
		css: {
			preprocessorMaxWorkers: true,
			preprocessorOptions: {
				scss: {
					additionalData: '@use "@/assets/scss/globals.scss" as *;',
				},
			},
		},
	},
	hooks: {
		"nitro:build:before"(nitro) {
			nitro.options.serverAssets.push({
				baseName: "entry",
				dir: "./server/assets/entry",
			});
		},
		"builder:watch": async (_event, path) => {
			if (path.includes("server/assets/entry")) {
				console.log("[manifest] Regenerating...");

				const { execSync } = await import("node:child_process");
				execSync("bun run generate:manifests");
			}
		},
	},
});
