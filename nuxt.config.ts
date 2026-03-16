// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    compatibilityDate: '2025-07-15',
    devtools: { enabled: false },
    modules: ['@nuxt/eslint', '@nuxt/image', '@pinia/nuxt'],
    nitro: {
        preset: 'vercel',
    },
    pages: false,

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
});
