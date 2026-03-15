<script setup lang="ts">
    import { useCreateAndRegisterWindow } from '~/components/Window/composables/useCreateAndRegisterWindow';

    const { setViewportObserver } = useContentArea();

    setViewportObserver();

    const route = useRoute();

    clearAllWindowsState();

    if (route.fullPath !== '/') {
        useCreateAndRegisterWindow(route.fullPath);
    }

    const { setDocumentEvent } = useFocusWindowController();

    setDocumentEvent();
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
