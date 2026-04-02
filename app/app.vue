<script setup lang="ts">
    import { useCreateAndRegisterWindow } from './components/Window/composables/useCreateAndRegisterWindow';

    const { setViewportObserver } = useContentArea();

    setViewportObserver();

    const route = useRoute();
    const { queuedPush } = useQueuedRouter();
    const aboutCookie = useCookie('about_visited', {
        maxAge: 60 * 60 * 24 * 365,
    });

    clearAllWindowsState();

    if (!aboutCookie.value && route.fullPath !== '/about-me') {
        aboutCookie.value = '1';
        await queuedPush('/about');
    } else {
        if (route.fullPath !== '/') {
            useCreateAndRegisterWindow(route.fullPath);
        }
    }

    useSeoUnfocus();
</script>
<template>
    <NuxtLayout>
        <WindowView />
        <Workbench />
        <ClientOnly>
            <Taskbar />
            <TaskbarTooltips />
        </ClientOnly>
    </NuxtLayout>
</template>
<style lang="scss">
    @use './assets/scss/main';
</style>
