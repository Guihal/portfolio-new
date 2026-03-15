<script setup lang="ts">
    import type { WindowOb } from '../Window';

    const { windowOb } = defineProps<{
        windowOb: WindowOb;
    }>();
</script>
<template>
    <WindowResizeTop :windowOb />
    <WindowResizeBottom :windowOb />
    <WindowResizeLeft :windowOb />
    <WindowResizeRight :windowOb />
    <WindowResizeLeftBottom :windowOb />
    <WindowResizeRightBottom :windowOb />
    <WindowResizeLeftTop :windowOb />
    <WindowResizeRightTop :windowOb />
</template>
<style lang="scss"></style>
