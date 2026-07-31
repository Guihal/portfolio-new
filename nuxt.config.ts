// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: "2025-07-15",
	devtools: { enabled: false },
	ssr: !process.env.NUXT_TEST_SPA,
	modules: ["@nuxt/eslint", "@nuxt/image", "@pinia/nuxt"],
	app: {
		head: {
			htmlAttrs: { lang: "ru" },
			title: "Портфолио Дмитрия Стаценко — fullstack-разработчик",
			meta: [
				{
					name: "description",
					content:
						"Портфолио fullstack-разработчика Дмитрия Стаценко (Nuxt, Vue, TypeScript, Pinia, WebGL): проекты, код, контакты. Сделано в стиле десктопной ОС.",
				},
				{ name: "theme-color", content: "#151515" },
				{ name: "robots", content: "index, follow" },
				{ property: "og:type", content: "website" },
				{ property: "og:site_name", content: "Dimonya OS" },
				{
					property: "og:title",
					content: "Портфолио Дмитрия Стаценко — fullstack-разработчик",
				},
				{
					property: "og:description",
					content: "Портфолио fullstack-разработчика: проекты, код, контакты.",
				},
				{
					property: "og:image",
					content: `${process.env.NUXT_PUBLIC_URL || "https://dimonya.studio"}/og/index.png`,
				},
				{
					property: "og:url",
					content: `${process.env.NUXT_PUBLIC_URL || "https://dimonya.studio"}/`,
				},
				{ property: "og:locale", content: "ru_RU" },
				{ name: "twitter:card", content: "summary_large_image" },
				{
					name: "twitter:title",
					content: "Портфолио Дмитрия Стаценко — fullstack-разработчик",
				},
				{
					name: "twitter:description",
					content: "Портфолио fullstack-разработчика: проекты, код, контакты.",
				},
			],
			link: [{ rel: "icon", type: "image/svg+xml", href: "/favicon.svg" }],
		},
	},
	typescript: {
		tsConfig: {
			compilerOptions: {
				strict: true,
				noUncheckedIndexedAccess: true,
			},
		},
	},
	nitro: {
		// Self-host: node-server preset → .output/server/index.mjs,
		// запускается `node .output/server/index.mjs` или `bun run preview`.
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
		// Postbuild: server/assets/entry копируется в .output/server/assets/entry
		// через scripts/copy-entry.ts (см. package.json#postbuild). Nitro serverAssets
		// не используется — scanTree идёт прямым fs.readdir от process.cwd().
	},
});
