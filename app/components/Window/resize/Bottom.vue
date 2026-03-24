<script setup lang="ts">
    import type { ChainedKey } from '../composables/useResizeForDirections';
    import type { WindowOb } from '../Window';
    const directions: [ChainedKey] = ['bottom'];

    const windowOb = inject('windowOb') as WindowOb;
</script>
<template>
    <WindowResize :directions="directions" :windowOb />
</template>
<style lang="scss" scoped>
    .window__resize__controlls {
        --bottom: 0;
        --top: auto;
        --left: 0;
        --width: var(--default-size);
        --height: var(--default-size-px);
        z-index: var(--z-index-sides);
        cursor: s-resize;
    }
</style>
