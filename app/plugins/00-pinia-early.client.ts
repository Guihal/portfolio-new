import { createPinia, getActivePinia, setActivePinia } from "pinia";

// Force Pinia to be active before app.vue setup runs.
// @pinia/nuxt 0.11.x sometimes registers its plugin late in SPA mode (ssr=false),
// causing "no active Pinia" errors during top-level await in app.vue setup.
export default defineNuxtPlugin({
	name: "pinia-early",
	enforce: "pre",
	setup(nuxtApp) {
		if (getActivePinia()) return;
		const pinia = createPinia();
		nuxtApp.vueApp.use(pinia);
		setActivePinia(pinia);
	},
});
