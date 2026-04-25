<script setup lang="ts">
    import type { WindowOb } from '../types';

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
