<script setup lang="ts">
    
    import { useAppBootstrap } from './composables/useAppBootstrap';
import { useViewportObserver } from './composables/useViewportObserver';

    useViewportObserver();

    await useAppBootstrap();

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
