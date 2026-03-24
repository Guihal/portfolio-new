<script setup lang="ts">
    import type { ChainedKey } from '../composables/useResizeForDirections';
    import type { WindowOb } from '../Window';
    const directions: [ChainedKey] = ['left'];

    const windowOb = inject('windowOb') as WindowOb;
</script>
<template>
    <WindowResize :directions="directions" :windowOb />
</template>
<style lang="scss" scoped>
    .window__resize__controlls {
        --top: 0;
        --left: 0;
        --width: var(--default-size-px);
        --height: var(--default-size);
        z-index: var(--z-index-sides);
        cursor: e-resize;
    }
</style>
