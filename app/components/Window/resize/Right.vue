<script setup lang="ts">
    import { useInjectWindow } from '~/components/Window/composables/useInjectWindow';
    import type { ChainedKey } from '../composables/useResizeForDirections';
    import type { WindowOb } from '../types';

    const directions: [ChainedKey] = ['right'];

    const windowOb = useInjectWindow();
</script>
<template>
    <WindowResize :directions="directions" :windowOb />
</template>
<style lang="scss" scoped>
    .window__resize__controlls {
        --top: 0;
        --right: 0;
        --width: var(--default-size-px);
        --height: var(--default-size);
        z-index: var(--z-index-sides);
        cursor: w-resize;
    }
</style>
