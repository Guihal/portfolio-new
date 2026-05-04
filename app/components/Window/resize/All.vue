<script setup lang="ts">
    import { useInjectWindow } from '~/components/Window/composables/lifecycle/useInjectWindow';

    const windowOb = useInjectWindow();
</script>
<template>
    <WindowResizeTop />
    <WindowResizeBottom />
    <WindowResizeLeft />
    <WindowResizeRight />
    <WindowResizeLeftBottom />
    <WindowResizeRightBottom />
    <WindowResizeLeftTop />
    <WindowResizeRightTop />
</template>
<style lang="scss"></style>
