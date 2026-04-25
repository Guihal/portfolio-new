import { createPinia, getActivePinia, setActivePinia } from "pinia";

// Force Pinia to be active before app.vue setup runs.
// @pinia/nuxt 0.11.x registers its plugin via 'modules:done' without
// enforce:'pre', so on both server (SSR) and client (SPA) user setup can run
// before vueApp.use(pinia) → "no active Pinia". Idempotent guard makes this
// safe regardless of whether the official plugin has run yet.
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
