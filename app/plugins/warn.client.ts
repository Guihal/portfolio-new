export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.config.warnHandler = (msg, instance, trace) => {
        console.warn(msg);
        console.log(instance);
        console.log(trace);
    };
});
