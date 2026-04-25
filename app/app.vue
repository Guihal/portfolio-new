<script setup lang="ts">
    
    import { useAppBootstrap } from './composables/useAppBootstrap';
import { useViewportObserver } from './composables/useViewportObserver';

    useViewportObserver();

    // SEO must wire up Pinia subscription BEFORE the top-level await — once
    // setup suspends, the Vue instance/inject context is lost on resume and
    // useFocusStore() errors with "no active Pinia".
    useSeoUnfocus();

    await useAppBootstrap();
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
