<script setup lang="ts">
    import { useInjectWindow } from '~/components/Window/composables/useInjectWindow';
    import type { WindowOb } from '../types';

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
