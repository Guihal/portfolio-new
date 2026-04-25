<script setup lang="ts">
    import { useCreateAndRegisterWindow } from './components/Window/composables/useCreateAndRegisterWindow';
    import { useViewportObserver } from './composables/useViewportObserver';
    import { useWindowsStore } from './stores/windows';

    useViewportObserver();

    const route = useRoute();

    useWindowsStore().$reset();

    if (route.fullPath !== '/') {
        useCreateAndRegisterWindow(route.fullPath);
    }

    onMounted(() => {
        const nuxtApp = useNuxtApp();
        nuxtApp.vueApp.config.warnHandler = (msg) => {
            logger.warn(msg);
        };
    });
</script>
<template>
    <NuxtLayout>
        <WindowView />
        <Workbench />
        <Taskbar />
    </NuxtLayout>
</template>
<style lang="scss">
    @use './assets/scss/main';
</style>
