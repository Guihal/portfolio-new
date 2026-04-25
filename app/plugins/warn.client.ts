export default defineNuxtPlugin((nuxtApp) => {
	nuxtApp.vueApp.config.warnHandler = (msg) => {
		logger.warn(msg);
	};
});
