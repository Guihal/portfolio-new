<script setup lang="ts">
    import type { WindowOb } from '../Window';

    const windowOb = inject('windowOb') as WindowOb;
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
